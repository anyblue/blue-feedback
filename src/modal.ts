import {template2dom} from './utils';
import ImagesUpload from './imagesUpload';
import styles from  './assets/css/index.less';

export default class Modal {
    el: HTMLElement;
    constructor(wrap: HTMLElement, title: string) {
        this.el = template2dom(`
            <div class="${`${styles.modal_wrap} ${styles.hidden}`}">
                <div class="${styles.modal}">
                    <h3 class="${styles.modal_header}">
                        ${title}
                        <i class="${styles.close_btn}"></i>
                    </h3>
                    <div class="${styles.modal_content}" ></div>
                    <div class="${styles.modal_footer}">
                        <button class="${`${styles.button} ${styles.enter}`}">确定<button>
                        <button class="${styles.button}">取消<button>
                    </div>
                </div>
            </div>
        `);
        const closeBtn = this.el.querySelector(`.${styles.close_btn}`);
        closeBtn?.addEventListener('click', this.cancle.bind(this));
        const cancleBtn = this.el.querySelector(`.${styles.close_btn}:not(.${styles.enter})`);
        cancleBtn?.addEventListener('click', this.cancle.bind(this));
        const enterBtn = this.el.querySelector(`.${styles.button}.${styles.enter} `);
        enterBtn?.addEventListener('click', this.enter.bind(this));

        const content = this.el.querySelector(`.${styles.modal_content}`);
        content?.appendChild(new ImagesUpload().el);

        wrap.appendChild(this.el);
    }
    cancle() {
        this.hidden();
    }
    enter() {
        this.hidden();
    }
    hidden() {
        document.body.style.overflow = '';
        document.body.style.position = '';
        this.el.className = `${styles.modal_wrap} ${styles.hidden}`;

    }
    show() {
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'relative';
        this.el.className = `${styles.modal_wrap} ${styles.show}`;
    }
}