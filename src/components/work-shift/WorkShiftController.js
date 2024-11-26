import { isEmptyWorkers, isEmptyString } from '../../utils/validate_utils.js';
import { convertToYYYYMMDD } from '../../utils/dates_utils.js';

export class WorkShiftController {
    constructor(component, view, service) {
        // view가 제대로 전달되었는지 확인
        if (!view) {
            throw new Error('View is required');
        }
        this.component = component;
        this.view = view;
        this.service = service;
        this.currentDate = new Date().toISOString().split('T')[0];
        this.isLoading = false;
    }

    async init() {
        this.showLoading();
        this.setupEventListeners();
        try {
            await this.loadAndSetConfig();
            await this.fetch();
            await this.updateView(this.currentDate);
        } catch (error) {
            console.error('init error', error)
            await this.updateErrorView(error);
        } finally {
            this.hideLoading();
        }
    }

    showLoading() {
        if (this.component.shadowRoot) {
            const existingLoadingElement = this.component.shadowRoot.querySelector('.loading-skeleton');
            if (existingLoadingElement) {
                existingLoadingElement.remove();
            }

            const loadingElement = this.view.renderLoading();
            const existingContainer = this.component.shadowRoot.querySelector('.work-shift');
            if (existingContainer) {
                existingContainer.replaceWith(loadingElement);
            } else {
                this.component.shadowRoot.appendChild(loadingElement);
            }
        } else {
            console.error('shadowRoot가 없습니다');
        }
        this.isLoading = true;
    }

    hideLoading() {
        const loadingElement = this.component.shadowRoot.querySelector('.loading-skeleton');
        if (loadingElement) {
            loadingElement.remove();
        }
        this.isLoading = false;
    }

    setupGoogleDriveButton() {
        const googleDriveButton = this.view.renderGoogleDriveButton();
        const existingContainer = this.component.shadowRoot.querySelector('.work-shift');
        if (existingContainer) {
            existingContainer.insertAdjacentHTML('beforeend', googleDriveButton);
            const driveButton = this.component.shadowRoot.querySelector('#download-from-drive');
            if (driveButton) {
                driveButton.style.display = 
                    localStorage.getItem('SHOW_DRIVE_BUTTON') !== 'false' ? 'block' : 'none';
            }
        }
    }

    setupEventListeners() {
        // Remove any existing event listeners if they exist
        if (this.eventListenersInitialized) {
            return;
        }

        this.component.shadowRoot.addEventListener('click', async (event) => {
            if (event.target.id === 'reset-shift') {
                this.currentDate = new Date().toISOString().split('T')[0];
                await this.updateView(this.currentDate);
            } else if (event.target.id === 'prev-date') {
                await this.navigateDate(-1);
            } else if (event.target.id === 'next-date') {
                await this.navigateDate(1);
            } else if (event.target.id === 'change-excel') {
                await this.handleExcelChange();
            } else if (event.target.id === 'open-settings') {
                this.openSettingsModal();
            } else if (event.target.id === 'close-settings') {
                this.closeSettingsModal();
            } else if (event.target.id === 'save-month-count') {
                await this.saveMonthCount(event);
            } else if (event.target.id === 'save-team-config') {
                await this.saveTeamConfig(event);
            } else if (event.target.id === 'reset-team-config') {
                await this.resetTeamConfig(event);
            } else if (event.target.id === 'download-from-drive') {
                await this.fetchFromGoogleDrive();
            }
        });

        const settingsModal = this.component.shadowRoot.querySelector('#settings-modal');
        if (settingsModal) {
            settingsModal.addEventListener('click', (event) => {
                if (event.target.id === 'settings-modal') {
                    this.closeSettingsModal();
                }
            });
        }

        // Use AbortController for cleanup
        this.keydownController?.abort();
        this.keydownController = new AbortController();

        const handleKeydown = async (event) => {
            const keyHandlers = {
                'Escape': () => this.closeSettingsModal(),
                'ArrowLeft': () => this.navigateDate(-1),
                'ArrowRight': () => this.navigateDate(1),
                ' ': () => this.navigateDate(0),
            };

            const handler = keyHandlers[event.key];
            if (handler) {
                await handler();
            }
        };
  
        document.addEventListener('keydown', handleKeydown, { 
            signal: this.keydownController.signal 
        });
        
        this.component.shadowRoot.addEventListener('change', async (event) => {
            if (event.target.id === 'date-input') {
                this.currentDate = event.target.value;
                await this.updateView(this.currentDate);
            }
            else if (event.target.id === 'team-filter') {
                this.service.config.currentTabName = event.target.value;
                localStorage.setItem('CURRENT_TEAM_FILTER', this.service.config.currentTabName);
                await this.handleTeamFilterChange();
            }
            else if (event.target.id === 'drive-button-toggle') {
                localStorage.setItem('SHOW_DRIVE_BUTTON', event.target.checked);
                const driveButton = this.component.shadowRoot.querySelector('#download-from-drive');
                if (driveButton) {
                    driveButton.style.display = event.target.checked ? 'block' : 'none';
                }
            }
        });

        // Mark that event listeners have been initialized
        this.eventListenersInitialized = true;
    }

    openSettingsModal() {
        const modal = this.component.shadowRoot.querySelector('#settings-modal');
        modal.style.display = 'block';
    }

    closeSettingsModal() {
        const modal = this.component.shadowRoot.querySelector('#settings-modal');
        modal.style.display = 'none';
    }

    async updateErrorView(error = "알 수 없는 에러") {
        const container = this.view.renderError(error);
        const existingContainer = this.component.shadowRoot.querySelector('.work-shift');
        if (existingContainer) {
            existingContainer.replaceWith(container);
        } else {
            this.component.shadowRoot.appendChild(container);
        }
        this.setupGoogleDriveButton();
    }
    
    /* @description 날짜 변경 시 호출되는 함수
     * @param {string} date - 날짜
     * @returns {Promise<void>}
    */
    async updateView(date) {
        this.showLoading();
        try {
            // view 존재 여부 확인
            if (!this.view || typeof this.view.render !== 'function') {
                console.error('View or render method is not properly initialized');
                throw new Error("뷰를 찾는데 실패");
            }
            const workers = await this.service.getWorkersByDate(date);
            if (isEmptyWorkers(workers)) {
                throw new Error("😵‍💫 근무자가 존재하지 않습니다. 팀설정이나 엑셀파일을 확인해주세요.")
            }

            // 현재 선택된 팀으로 workers 필터링
            const filteredWorkers = this.service.config.currentTabName === 'all' 
                ? workers 
                : this.service.filterWorkersByTeam(workers, this.service.config.currentTabName);

            const container = this.view.render(date, filteredWorkers, this.service.config.teamNames);
            
            const existingContainer = this.component.shadowRoot.querySelector('.work-shift');
            if (existingContainer) {
                existingContainer.replaceWith(container);
                // 팀 필터 선택값 복원
                const teamFilter = this.component.shadowRoot.querySelector('#team-filter');
                if (teamFilter) {
                    teamFilter.value = this.service.config.currentTabName;
                }
            } else {
                this.component.shadowRoot.appendChild(container);
            }
            this.setupGoogleDriveButton();
        } catch (error) {
            console.error('updateView error', error);
            await this.updateErrorView(error);
        } finally {
            this.hideLoading();
        }
    }

    async handleTeamFilterChange() {
        try {
            const workers = await this.service.getWorkersByDate(this.currentDate);
            const container = this.component.shadowRoot.querySelector('.work-shift');
            const table = container.querySelector('table');
            const oldWorkersList = table.querySelectorAll('tr:not(thead tr):not(#setting-header)');
            oldWorkersList.forEach(tr => tr.remove());
            const teamName = this.component.shadowRoot.querySelector('#team-filter')?.value || 'all';
            const filteredWorkers = this.service.filterWorkersByTeam(workers, teamName);
            if (isEmptyWorkers(filteredWorkers)) {
                this.updateErrorView(`${teamName} 팀에 속한 데이터가 없습니다.\n 설정에서 팀 설정이나 엑셀 파일을 확인해주세요.`);
                return;
            }
            const newWorkersList = this.view.renderWorkersList(filteredWorkers);
            table.insertAdjacentHTML('beforeend', newWorkersList);
        } catch (error) {
            console.error('handleTeamFilterChange error', error);
            await this.updateErrorView(error);
        }
    }

    async handleExcelChange() {
        try {
            const filePath = await window.electronAPI.open_file_dialog();
            localStorage.setItem('EXCEL_FILE_PATH', filePath);
            window.electronAPI.set_file_path(filePath);
            alert(`엑셀 파일 경로가 ${filePath}로 변경되었습니다.`);
            location.reload();
        } finally {
            this.hideLoading();
        }
    }

    async fetch() {
        await this.service.fetch_xlsx();
    }

    async fetchFromGoogleDrive() {
        this.showLoading();
        try {
            const filePath = await this.service.fetchFromGoogleDrive();
            if (filePath && filePath !== this.service.config.excelPath) {
                const shouldChange = confirm('기존 파일 경로와 다릅니다. 새로운 경로로 변경하시겠습니까?');
                if (!shouldChange) {
                    throw new Error('파일 경로 변경 취소');
                }
                localStorage.setItem('EXCEL_FILE_PATH', filePath);
                window.electronAPI.set_file_path(filePath);
            }
        } catch (error) {
            console.error('fetchFromGoogleDrive error', error);
            await this.updateErrorView(error);
        } finally {
            this.hideLoading();
            location.reload();
        }
    }

    async setConfig(config) {
        this.service.config = config;
        localStorage.setItem('EXCEL_FILE_PATH', config.excelPath);
        await window.electronAPI.set_file_path(config.excelPath);
        localStorage.setItem('MONTH_COUNT', config.monthCount);
        localStorage.setItem('TEAM_CONFIG', isEmptyString(config.teamConfig) ? this.service.config.originalTeamConfig : config.teamConfig);
    }

    async loadAndSetConfig() {
        const excelPath = !isEmptyString(localStorage.getItem('EXCEL_FILE_PATH')) ? localStorage.getItem('EXCEL_FILE_PATH') : this.service.config.excelPath;
        const monthCount = localStorage.getItem('MONTH_COUNT') || '3';
        let teamConfig = localStorage.getItem('TEAM_CONFIG');
        const currentTabName = localStorage.getItem('CURRENT_TEAM_FILTER') || 'all';
        await this.setConfig({ ...this.service.config, excelPath, monthCount, teamConfig, currentTabName });
    }

    async saveMonthCount(event) {
        const monthCount = Number(event.target.parentElement.querySelector('#month-count').value);
        try {
            await this.setConfig({ ...this.service.config, monthCount });
            alert(`가지고 올 수 있는 최대 월 수를 ${monthCount}로 변경했습니다.`);
            location.reload();
        } catch (error) {
            console.error('saveMonthCount error', error);
            await this.updateErrorView(error);
        } finally {
            this.closeSettingsModal();
        }
    }

    async saveTeamConfig() {
        const newTeamConfig = this.component.shadowRoot.querySelector('#team-config').value;
        try {
            JSON.parse(newTeamConfig);
        } catch (error) {
            alert('유효하지 않은 형식이라 저장할 수 없습니다. \n오류: ' + error.message);
            return;
        }
        try {
            await this.setConfig({ ...this.service.config, teamConfig: JSON.stringify(JSON.parse(newTeamConfig)) });
            alert('팀 설정이 변경되었습니다.');
            location.reload();
        } catch (error) {
            console.error('saveTeamConfig error', error);
            await this.updateErrorView(error);
        } finally {
            this.closeSettingsModal();
        }
    }

    async resetTeamConfig() {
        const teamConfig = this.component.shadowRoot.querySelector('#team-config');
        teamConfig.value = JSON.stringify(JSON.parse(this.service.config.originalTeamConfig), null, 2);
    }

    /* @description 날짜 변경 시 호출되는 함수
     * @param {number} dayOffset - 변경할 날짜 오프셋, 0일 경우 오늘 날짜로 변경
     * @returns {Promise<void>}
    */
    async navigateDate (dayOffset) {
        if (dayOffset === 0) {
            this.currentDate = new Date().toISOString().split('T')[0];
            this.component.shadowRoot.querySelector('#date-input').value = this.currentDate;
            await this.updateView(this.currentDate);
            return;
        }
        const date = new Date(this.currentDate);
        date.setDate(date.getDate() + dayOffset);
        
        this.currentDate = convertToYYYYMMDD(date);
        await this.updateView(this.currentDate);
        this.component.shadowRoot.querySelector('#date-input').value = this.currentDate;
    };
}
