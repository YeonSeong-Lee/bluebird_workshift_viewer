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
        this.setupEventListeners();
    }

    showLoading() {
        const workShiftElement = this.component.shadowRoot.querySelector('.work-shift');
        const loadingElement = document.createElement('div');
        loadingElement.className = 'loading-skeleton';
        loadingElement.innerHTML = `
            <style>
                .loading-skeleton {
                    margin: 20px;
                    width: calc(100% - 40px); /* work-shift와 동일한 마진 적용 */
                }
                .skeleton-table {
                    width: 100%;
                    background: white;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                }
                .skeleton-header {
                    height: 55px; /* 헤더 높이와 일치 */
                    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                    background-size: 200% 100%;
                    animation: shimmer 1.5s infinite;
                }
                .skeleton-controls {
                    display: flex;
                    justify-content: space-between;
                    gap: 12px;
                    padding: 12px;
                    border-bottom: 1px solid #ddd;
                }
                .skeleton-control {
                    height: 43px; /* 컨트롤 요소들과 동일한 높이 */
                    width: 120px;
                    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                    background-size: 200% 100%;
                    animation: shimmer 1.5s infinite;
                    border-radius: 4px;
                }
                .skeleton-row {
                    height: 51px; /* td 패딩 포함한 높이 */
                    margin: 0;
                    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                    background-size: 200% 100%;
                    animation: shimmer 1.5s infinite;
                    border-bottom: 1px solid #ddd;
                }
                @keyframes shimmer {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
            </style>
            <div class="skeleton-table">
                <div class="skeleton-header"></div>
                <div class="skeleton-controls">
                    <div class="skeleton-control"></div>
                    <div class="skeleton-control"></div>
                </div>
                <div class="skeleton-row"></div>
                <div class="skeleton-row"></div>
                <div class="skeleton-row"></div>
                <div class="skeleton-row"></div>
                <div class="skeleton-row"></div>
            </div>
        `;

        if (this.component.shadowRoot) {
            if (workShiftElement) {
                workShiftElement.style.display = 'none';
            }
            this.component.shadowRoot.appendChild(loadingElement);
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

    setupEventListeners() {
        this.component.shadowRoot.addEventListener('click', async (event) => {
            if (event.target.id === 'reset-shift') {
                this.currentDate = new Date().toISOString().split('T')[0];
                await this.updateView(this.currentDate);
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
            }
        });

        this.component.shadowRoot.querySelector('#settings-modal')?.addEventListener('click', (event) => {
            if (event.target.id === 'settings-modal') {
                this.closeSettingsModal();
            } 
        });

        this.component.shadowRoot.addEventListener('change', async (event) => {
            if (event.target.id === 'date-input') {
                this.currentDate = event.target.value;
                await this.updateView(this.currentDate);
            }
            else if (event.target.id === 'team-filter') {
                await this.handleTeamFilterChange();
            }
        });
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
    }

    async updateView(date) {
        this.showLoading();
        try {
            // view 존재 여부 확인
            if (!this.view || typeof this.view.render !== 'function') {
                console.error('View or render method is not properly initialized');
                throw new Error("뷰를 찾는데 실패");
            }
            const workers = await this.service.getWorkersByDate(date);
            const container = this.view.render(date, workers, this.service.config.teamNames);
            
            const existingContainer = this.component.shadowRoot.querySelector('.work-shift');
            if (existingContainer) {
                existingContainer.replaceWith(container);
            } else {
                this.component.shadowRoot.appendChild(container);
            }
        } catch (error) {
            console.error('updateView error', error);
            await this.updateErrorView(error);
        } finally {
            this.hideLoading();
        }
    }

    async handleTeamFilterChange() {
        this.showLoading();
        try {
            const workers = await this.service.getWorkersByDate(this.currentDate);
            const container = this.component.shadowRoot.querySelector('.work-shift');
            const table = container.querySelector('table');
            const oldWorkersList = table.querySelectorAll('tr:not(thead tr):not(#setting-header)');
            oldWorkersList.forEach(tr => tr.remove());
            const filteredWorkers = this.service.filterWorkersByTeam(workers, this.component.shadowRoot.querySelector('#team-filter')?.value || 'all');
            const newWorkersList = this.view.renderWorkersList(filteredWorkers);
            table.insertAdjacentHTML('beforeend', newWorkersList);
        } catch (error) {
            console.error('handleTeamFilterChange error', error);
            await this.updateErrorView(error);
        } finally {
            this.hideLoading();
        }
    }

    async handleExcelChange() {
        this.showLoading();
        try {
            const filePath = await window.electronAPI.open_file_dialog();
            localStorage.setItem('EXCEL_FILE_PATH', filePath);
            window.electronAPI.set_file_path(filePath);
            location.reload();
        } finally {
            this.hideLoading();
        }
    }

    async fetch() {
        await this.service.fetch_xlsx();
    }

    async setConfig(config) {
        this.service.config = config;
        localStorage.setItem('EXCEL_FILE_PATH', config.excelPath);
        localStorage.setItem('MONTH_COUNT', config.monthCount);
        localStorage.setItem('TEAM_CONFIG', (config.teamConfig === '' || config.teamConfig === 'undefined' || config.teamConfig === 'null') ? this.service.config.originalTeamConfig : config.teamConfig);
    }

    async loadAndSetConfig() {
        const excelPath = localStorage.getItem('EXCEL_FILE_PATH');
        const monthCount = localStorage.getItem('MONTH_COUNT') || '3';
        let teamConfig = localStorage.getItem('TEAM_CONFIG');
        await this.setConfig({ ...this.service.config, excelPath, monthCount, teamConfig });
    }

    async saveMonthCount(event) {
        const monthCount = Number(event.target.parentElement.querySelector('#month-count').value);
        try {
            await this.setConfig({ ...this.service.config, monthCount });
            alert(`가지고 올 수 있는 최대 월 수를 ${monthCount}로 변경했습니다.`);
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
            await this.setConfig({ ...this.service.config, teamConfig: JSON.stringify(JSON.parse(newTeamConfig)) });
            alert('팀 설정이 변경되었습니다.');
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
}
