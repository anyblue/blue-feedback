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
            <ul class="${`${styles.dropdown} ${styles.hidden}`}">
            ${option.map((item, index) => `<li drop-index="${index}">${item.text}</li>`).join('')}
            </ul>
        `);
        this.option = option;
        this.addEventListener(this.el, 'click', event => {
            event.target as HTMLElement|null;
            const target = event.target as HTMLElement|null;
            const index = Number(target?.getAttribute('drop-index'));
            if (option[index]) {
                option[index].handler();
                this.hidden();
            }
        });
        this.addEventListener(document.documentElement, 'click', event => {
            const eventPath = event.composedPath();
            if (eventPath.includes(this.el)) {
                return;
            }
            if (!eventPath.includes(wrap) || this.actived) {
                this.hidden();
            }
            else {
                this.show();
            }
        });

        wrap.appendChild(this.el);
    }
    hidden(): void {
        this.actived = false;
        this.el.className = `${styles.dropdown} ${styles.hidden}`;
    }
    show(): void {
        this.actived = true;
        this.el.className = `${styles.dropdown} ${styles.show}`;
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
