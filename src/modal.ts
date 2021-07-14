import {template2dom, EventCleaner} from './utils';
import ImagesUpload from './imagesUpload';
import Textarea from './textarea';
import styles from  './assets/css/index.less';

export default class Modal extends EventCleaner {
    el: HTMLElement;
    private imagesUpload: ImagesUpload;
    private textarea: Textarea;

    constructor(wrap: HTMLElement, title: string, placeholder: string) {
        super();
        this.el = template2dom(`
            <div class="${`${styles.modal_wrap} ${styles.hidden}`}">
                <div class="${styles.modal}">
                    <h3 class="${styles.modal_header}">
                        ${title}
                        <i class="${styles.close_btn}"></i>
                    </h3>
                    <div class="${styles.modal_content}" ></div>
                    <div class="${styles.modal_footer}">
                        <button class="${`${styles.button} ${styles.enter}`}">确定</button>
                        <button class="${styles.button}">取消</button>
                    </div>
                </div>
            </div>
        `);
        const closeBtn = this.el.querySelector(`.${styles.close_btn}`) as HTMLElement|null;
        closeBtn && this.addEventListener(closeBtn, 'click', this.cancle.bind(this));

        const cancleBtn = this.el.querySelector(`.${styles.button}:not(.${styles.enter})`) as HTMLElement|null;
        cancleBtn && this.addEventListener(cancleBtn, 'click', this.cancle.bind(this));

        const enterBtn = this.el.querySelector(`.${styles.button}.${styles.enter} `) as HTMLElement|null;
        enterBtn && this.addEventListener(enterBtn, 'click', this.enter.bind(this));

        const content = this.el.querySelector(`.${styles.modal_content}`);
        this.imagesUpload = new ImagesUpload();
        this.textarea = new Textarea({placeholder, maxLength: 20});
        content?.appendChild(this.imagesUpload.el);
        content?.appendChild(this.textarea.el);

        wrap.appendChild(this.el);
    }
    private cancle() {
        this.hidden();
    }
    private enter() {
        this.hidden();
    }
    hidden() {
        document.body.style.overflow = '';
        document.body.style.position = '';
        this.el.className = `${styles.modal_wrap} ${styles.hidden}`;
        this.imagesUpload.setFiles([], false);
        this.textarea.setValue('');
    }
    show() {
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'relative';
        this.el.className = `${styles.modal_wrap} ${styles.show}`;
    }
    unmounted() {
        this.imagesUpload.unmounted();
        this.textarea.unmounted();
        this.cleanEvent();
    }
}
