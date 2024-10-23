import { WorkShiftView } from './WorkShiftView.js';
import { WorkShiftController } from './WorkShiftController.js';
import { WorkShiftService } from './WorkShiftService.js';
import css from './work-shift-css.js';

export class WorkShift extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        
        // 컴포넌트 초기화
        this.view = new WorkShiftView(this.shadowRoot);
        this.controller = new WorkShiftController(this, this.view, WorkShiftService);
        
        this.setupStyles();
        this.setupInitialView();
    }

    setupStyles() {
        const style = document.createElement('style');
        style.textContent = css;
        this.shadowRoot.appendChild(style);
    }

    setupInitialView() {
        const container = document.createElement('div');
        container.classList.add('container');
        this.shadowRoot.appendChild(container);
        container.appendChild(this.view.showLoadingScreen());
    }

    // ... 나머지 메서드들
}

customElements.define('work-shift', WorkShift);
