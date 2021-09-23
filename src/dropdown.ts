import Modal from './modal';
import {template2dom, EventCleaner} from './utils/utils';
import styles from './assets/css/dropdown.less';

export interface Option {
    text: string;
    modal?: Modal;
    handler(): void;
}

export class Dropdown extends EventCleaner {
    el: HTMLElement;
    actived = false;
    option: Option[];
    constructor(wrap: HTMLElement, option: Option[]) {
        super();
        this.el = template2dom(`
            <div class="${`${styles.dropdown_wrap} ${styles.hidden}`}">
                <ul class="${styles.dropdown}">
                ${option.map((item, index) => `<li drop-index="${index}">${item.text}</li>`).join('')}
                </ul>
            </div>
        `);
        this.option = option;
        this.addEventListener(this.el, 'click', event => {
            event.target as HTMLElement|null;
            const target = event.target as HTMLElement|null;
            const index = parseInt(String(target?.getAttribute('drop-index')), 10);
            if (option[index]) {
                option[index].handler();
                this.hidden();
            }
        });
        this.addEventListener(wrap, 'mouseenter', () => {
            this.show();
        });
        this.addEventListener(wrap, 'mouseleave', () => {
            this.hidden();
        });

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
