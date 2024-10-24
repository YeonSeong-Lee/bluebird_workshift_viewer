import { WorkShiftView } from './WorkShiftView.js';
import { WorkShiftController } from './WorkShiftController.js';
import { WorkShiftService } from './WorkShiftService.js';

export class WorkShift extends HTMLElement {
    #controller;
    #view;
    
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    async connectedCallback() {
        await this.setupComponent();
    }

    async setupComponent() {
        this.setupStyles();
        
        this.#view = new WorkShiftView(this.shadowRoot);
        this.#controller = new WorkShiftController(this, this.#view, WorkShiftService);
        
        await this.#controller.init();
    }

    setupStyles() {
        const linkElem = document.createElement('link');
        linkElem.setAttribute('rel', 'stylesheet');
        linkElem.setAttribute('href', './components/work-shift/styles/work-shift.css');
        this.shadowRoot.appendChild(linkElem);
    }

    getController() {
        return this.#controller;
    }
}

customElements.define('work-shift', WorkShift);
