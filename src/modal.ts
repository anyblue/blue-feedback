import {template2dom, EventCleaner} from './utils';
import ImagesUpload from './imagesUpload';
import Textarea from './textarea';
import styles from './assets/css/index.less';

export default class Modal extends EventCleaner {
    el: HTMLElement;
    private readonly imagesUpload: ImagesUpload;
    private readonly textarea: Textarea;

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
                        <button class="${`${styles.button} ${styles.enter} ${styles.disabled}`}">确定</button>
                        <button class="${styles.button}">取消</button>
                    </div>
                </div>
            </div>
        `);
        const closeBtn: HTMLElement|null = this.el.querySelector(`.${styles.close_btn}`);
        closeBtn && this.addEventListener(closeBtn, 'click', this.cancle.bind(this));

        const cancleBtn: HTMLElement|null = this.el.querySelector(`.${styles.button}:not(.${styles.enter})`);
        cancleBtn && this.addEventListener(cancleBtn, 'click', this.cancle.bind(this));

        const enterBtn: HTMLElement|null = this.el.querySelector(`.${styles.button}.${styles.enter} `);
        enterBtn && this.addEventListener(enterBtn, 'click', this.enter.bind(this));

        const content = this.el.querySelector(`.${styles.modal_content}`);
        this.imagesUpload = new ImagesUpload();
        this.textarea = new Textarea({placeholder, maxLength: 2000});
        content?.appendChild(this.imagesUpload.el);
        content?.appendChild(this.textarea.el);

        let filesError: Error[]|null = null;
        let textareaError: Error|null = null;
        this.imagesUpload.onchange(err => {
            filesError = err;
            if (!enterBtn) {
                return;
            }
            if (textareaError || filesError?.length) {
                enterBtn.className = `${styles.button} ${styles.enter} ${styles.disabled}`;
            }
            else {
                enterBtn.className = `${styles.button} ${styles.enter}`;
            }
        });
        this.textarea.onchange((err, length) => {
            textareaError = err;
            if (!enterBtn) {
                return;
            }
            if (!length) {
                textareaError = new Error('文字描述必填');
            }
            if (textareaError || filesError?.length) {
                enterBtn.className = `${styles.button} ${styles.enter} ${styles.disabled}`;
            }
            else {
                enterBtn.className = `${styles.button} ${styles.enter}`;
            }
        });

        wrap.appendChild(this.el);
    }
    hidden(): void {
        document.body.style.overflow = '';
        document.body.style.position = '';
        this.el.className = `${styles.modal_wrap} ${styles.hidden}`;
        this.imagesUpload.setFiles([], false);
        this.textarea.value = '';
    }
    show(): void {
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'relative';
        this.el.className = `${styles.modal_wrap} ${styles.show}`;
    }
    unmounted(): void {
        this.imagesUpload.unmounted();
        this.textarea.unmounted();
        this.cleanEvent();
    }
    private cancle(): void {
        this.hidden();
    }
    private enter(): void {
        this.hidden();
    }
}
