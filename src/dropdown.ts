import Modal from './modal';
import {template2dom} from './utils';
import styles from  './assets/css/index.css';

export interface Option {
    text: string;
    modal?: Modal;
    handler(): void;
}

export class Dropdown {
    el: HTMLElement
    actived = false;
    constructor(wrap: HTMLElement, option: Option[]) {
        this.el = template2dom(`
            <ul class="${`${styles.dropdown} ${styles.hidden}`}">${
                option.map((item, index) =>
                    `<li drop-index="${index}">${item.text}</li>`)
                    .join('')
            }</ul>
        `);
        this.el.addEventListener('click', event => {
            event.target as HTMLElement|null;
            const target = event.target as HTMLElement|null;
            const index = Number(target?.getAttribute('drop-index'))
            if (option[index]) {
                option[index].handler();
                this.hidden();
            }
        });
        document.documentElement.addEventListener('click', event => {
            const eventPath = event.composedPath()
            if (eventPath.includes(this.el)) {
                return;
            }
            if (!eventPath.includes(wrap)|| this.actived) {
                this.hidden();
            }
            else {
                this.show();
            }
        });

        wrap.appendChild(this.el);
    }
    hidden() {
        this.actived = false;
        this.el.className = `${styles.dropdown} ${styles.hidden}`;
    }
    show() {
        this.actived = true;
        this.el.className = `${styles.dropdown} ${styles.show}`;
    }
}