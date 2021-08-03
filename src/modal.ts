import {template2dom, EventCleaner} from './utils';
import ImagesUpload from './imagesUpload';
import Textarea from './textarea';
import styles from './assets/css/index.less';
type EnterHandle = (data: FormData) => Promise<unknown>;
class ValidateError extends Error {
    name = 'ValidateError';
};
export default class Modal extends EventCleaner {
    el: HTMLElement;
    private readonly imagesUpload: ImagesUpload;
    private readonly textarea: Textarea;
    private enterHandle?: EnterHandle;
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
                        <button
                            class="${`${styles.button} ${styles.enter}`}"
                            disabled="disabled">
                        <svg width="16" height="16" viewBox="0 0 48 48" focusable="false">
                            <path
                                d="M42 36.65a22 22 0 1 1 0-25.3"
                                stroke="currentColor"
                                stroke-width="4"
                                fill="none"
                                stroke-linecap="round"
                                stroke-linejoin="round"></path>
                        </svg>
                        确定
                        </button>
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
        const checkError = () => {
            if (!enterBtn) {
                return;
            }
            if (textareaError || filesError?.length || !this.textarea.value.length) {
                enterBtn.setAttribute('disabled', 'disabled');
            }
            else {
                enterBtn.removeAttribute('disabled');
            }
        };
        this.imagesUpload.onchange(err => {
            filesError = err;
            checkError();
        });
        this.textarea.onchange((err, length) => {
            textareaError = err;
            if (!length && ![...this.el.classList].includes(styles.hidden)) {
                this.emiterror(textareaError = new ValidateError('文字描述必填'));
            }
            checkError();
        });
        wrap.appendChild(this.el);
    }
    hidden(): void {
        document.body.style.overflow = '';
        document.body.style.position = '';
        this.el.className = `${styles.modal_wrap} ${styles.hidden}`;
        void this.imagesUpload.setFiles([], false);
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
        this.clearEvent();
    }
    onenter(cb: EnterHandle): void {
        this.enterHandle = cb;
    }
    private cancle(): void {
        this.hidden();
    }
    private async enter() {
        const enterBtn: HTMLElement|null = this.el.querySelector(`.${styles.button}.${styles.enter} `);
        if (enterBtn) {
            enterBtn.className = `${styles.button} ${styles.enter} ${styles.loading}`;
            enterBtn.setAttribute('disabled', 'disabled');
        }
        try {
            let formData = new window.FormData();
            formData.append('adviceContent', this.textarea.value);
            if (this.imagesUpload.files.length) {
                this.imagesUpload.files.forEach(item => {
                    formData.append('files', item.detail, item.detail.name);
                });
            }
            await this.enterHandle?.call(null, formData);
        }
        catch (e) {
            this.emiterror(e);
        }
        finally {
            if (enterBtn) {
                enterBtn.className = `${styles.button} ${styles.enter}`;
                enterBtn.removeAttribute('disabled');
            }
            this.hidden();
        }
    }
}
