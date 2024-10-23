export class WorkShiftController {
    constructor(component, view, service) {
        this.component = component;
        this.view = view;
        this.service = service;
    }

    setupEventListeners() {
        this.component.shadowRoot.addEventListener('change', (event) => {
            if (event.target.id === 'date-input') {
                this.handleDateChange(event);
            }
        });

        this.component.shadowRoot.addEventListener('click', (event) => {
            if (event.target.id === 'reset-shift') {
                this.handleResetShift();
            } else if (event.target.id === 'change-excel') {
                this.handleExcelChange();
            }
        });
    }

    async handleExcelChange() {
        const filePath = await window.electronAPI.open_file_dialog();
        localStorage.setItem('EXCEL_FILE_PATH', filePath);
        window.electronAPI.set_file_path(filePath);
        location.reload();
    }
}
