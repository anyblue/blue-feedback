import Modal from './modal';
import {template2dom, EventCleaner} from './utils/utils';
import styles from './assets/css/dropdown.less';

export interface Option {
    text: string;
    modal?: Modal;
    handler(): void;
}

export interface Params {
    mode: 'dropdown'|'expand';
    option: Option[];
}

export class Dropdown extends EventCleaner {
    el: HTMLElement;
    mode: 'dropdown'|'expand';
    option: Option[];
    actived = false;
    constructor(wrap: HTMLElement, params: Params) {
        super();
        this.mode = params.mode;
        this.option = params.option;
        const dropdownWrapClass = this.mode === 'dropdown'
            ? `${styles.dropdown_wrap} ${styles.hidden}`
            : styles.dropdown_expand;
        this.el = template2dom(`
            <div class="${dropdownWrapClass}">
                <ul class="${styles.dropdown}">
                ${this.option.map((item, index) => `<li drop-index="${index}">${item.text}</li>`).join('')}
                </ul>
            </div>
        `);
        this.addEventListener(this.el, 'click', event => {
            event.target as HTMLElement|null;
            const target = event.target as HTMLElement|null;
            const index = parseInt(String(target?.getAttribute('drop-index')), 10);
            if (this.option[index]) {
                this.option[index].handler();
                this.mode === 'dropdown' && this.hidden();
            }
        });
        if (this.mode === 'dropdown') {
            this.addEventListener(wrap, 'mouseenter', () => {
                this.show();
            });
            this.addEventListener(wrap, 'mouseleave', () => {
                this.hidden();
            });
        }
        wrap.appendChild(this.el);
    }
    hidden(): void {
        this.actived = false;
        this.el.className = `${styles.dropdown_wrap} ${styles.hidden}`;
    }
    show(): void {
        this.actived = true;
        this.el.className = `${styles.dropdown_wrap} ${styles.show}`;
    }
    unmounted(): void {
        this.clearEvent();
        this.option.forEach(item => {
            if (item.modal) {
                item.modal.unmounted();
            }
        });
    }
}
