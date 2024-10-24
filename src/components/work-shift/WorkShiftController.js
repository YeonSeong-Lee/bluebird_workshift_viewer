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
            await this.fetch();
            await this.loadAndSetConfig();
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
        const loadingElement = document.createElement('div');
        loadingElement.className = 'loading-spinner';
        loadingElement.innerHTML = `
            <style>
                .loading-spinner {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(255, 255, 255, 0.8);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                }
                .loading-spinner::after {
                    content: "";
                    width: 50px;
                    height: 50px;
                    border: 5px solid #f3f3f3;
                    border-top: 5px solid #3498db;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
        if (this.component.shadowRoot) {
            this.component.shadowRoot.appendChild(loadingElement);
        } else {
            console.error('shadowRoot가 없습니다');
        }
        this.isLoading = true;
    }

    hideLoading() {
        const loadingElement = this.component.shadowRoot.querySelector('.loading-spinner');
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
                this.saveMonthCount(event);
            } else if (event.target.id === 'save-team-config') {
                this.saveTeamConfig(event);
            } else if (event.target.id === 'reset-team-config') {
                this.resetTeamConfig(event);
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
            const container = this.view.render(date, workers);
            
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
        localStorage.setItem('TEAM_CONFIG', config.teamConfig);
    }

    async loadAndSetConfig() {
        const excelPath = localStorage.getItem('EXCEL_FILE_PATH');
        const monthCount = localStorage.getItem('MONTH_COUNT') || '3';
        const teamConfig = localStorage.getItem('TEAM_CONFIG');
        const originalTeamConfig = this.service.config.originalTeamConfig;
        await this.setConfig({ excelPath, monthCount, teamConfig, originalTeamConfig });
    }

    async saveMonthCount(event) {
        const monthCount = event.target.parentElement.querySelector('#month-count').value;
        await this.setConfig({ ...this.service.config, monthCount });
    }

    async saveTeamConfig() {
        const newTeamConfig = this.component.shadowRoot.querySelector('#team-config').value;
        await this.setConfig({ ...this.service.config, teamConfig: JSON.stringify(JSON.parse(newTeamConfig)) });
    }

    async resetTeamConfig() {
        const teamConfig = this.component.shadowRoot.querySelector('#team-config');
        teamConfig.value = JSON.stringify(JSON.parse(this.service.config.originalTeamConfig), null, 2);
        await this.setConfig({ ...this.service.config, teamConfig: JSON.stringify(JSON.parse(teamConfig.value)) });
    }
}
