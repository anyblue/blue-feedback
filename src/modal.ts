import {template2dom, EventCleaner} from './utils/utils';
import {ValidateError} from './utils/error';
import Evaluate, {Params as EvaluateOpt} from './evaluate';
import ImagesUpload, {Params as ImageOpt} from './imagesUpload';
import Textarea, {Params as TextOpt} from './textarea';

import styles from './assets/css/modal.less';

type EnterHandle = (data: FormData) => Promise<unknown>;

interface Label {
    label?: string;
}
export interface Params {
    title: string;
    evaluate?: EvaluateOpt&Label;
    img?: ImageOpt&Label;
    text?: TextOpt&Label;
}

const formRow = (el: HTMLElement, label: string, required?: boolean) => {
    const row = template2dom(`
        <div class="${styles.form_row}">
            <label class="${required ? styles.required : ''}">${label}</label>
        </div>
    `);
    row.appendChild(el);
    return row;
};

export default class Modal extends EventCleaner {
    el: HTMLElement;
    private readonly evaluate?: Evaluate;
    private readonly imagesUpload?: ImagesUpload;
    private readonly textarea?: Textarea;
    private enterHandle?: EnterHandle;
    constructor(wrap: HTMLElement, params: Params) {
        super();
        this.el = template2dom(`
            <div class="${`${styles.modal_wrap} ${styles.hidden}`}">
                <div class="${styles.modal}">
                    <h3 class="${styles.modal_header}">
                        ${params.title}
                        <i class="${styles.close_btn}"></i>
                    </h3>
                    <div class="${styles.modal_content}"></div>
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

        let filesError: Error[]|null = null;
        let textareaError: Error|null = null;

        const checkError = () => {
            if (!enterBtn) {
                return;
            }
            const evaluateError = this.evaluate && !this.evaluate?.value;
            const imgError = this.imagesUpload && filesError?.length;
            const textError = this.textarea
            && (textareaError || params?.text?.required && !this.textarea.value.length);
            if (evaluateError || textError || imgError) {
                enterBtn.setAttribute('disabled', 'disabled');
            }
            else {
                enterBtn.removeAttribute('disabled');
            }
        };

        if (params.evaluate) {
            this.evaluate = new Evaluate(params.evaluate);
            content?.appendChild(
                params.evaluate?.label
                    ? formRow(this.evaluate.el, params.evaluate?.label ?? '满意度')
                    : this.evaluate.el
            );
            this.evaluate?.onchange(checkError);
        }

        if (params.img) {
            this.imagesUpload = new ImagesUpload(params.img);
            content?.appendChild(formRow(this.imagesUpload.el, params.img?.label ?? '上传图片'));
            this.imagesUpload.onchange(err => {
                filesError = err;
                checkError();
            });
        }

        if (params.text) {
            params.text.required = params.text?.required !== undefined ? params.text?.required : true;
            this.textarea = new Textarea(params.text);
            content?.appendChild(formRow(
                this.textarea.el, params.text?.label ?? '文字描述',
                params.text.required
            ));
            this.textarea.onchange((err, length) => {
                textareaError = err;
                if (!length && ![...this.el.classList].includes(styles.hidden)) {
                    textareaError = new ValidateError('文字描述必填');
                }
                checkError();
            });
        }
        wrap.appendChild(this.el);
    }
    hidden(): void {
        document.body.style.overflow = '';
        document.body.style.position = '';
        this.el.className = `${styles.modal_wrap} ${styles.hidden}`;
        if (this.evaluate) {
            this.evaluate.value = '';
        }
        if (this.textarea) {
            this.textarea.value = '';
        }
        void this.imagesUpload?.setFiles([], false);
    }
    show(): void {
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'relative';
        this.el.className = `${styles.modal_wrap} ${styles.show}`;
    }
    unmounted(): void {
        this.evaluate?.unmounted();
        this.imagesUpload?.unmounted();
        this.textarea?.unmounted();
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
            formData.append('adviceContent', this.textarea?.value ?? '');
            formData.append('evaluateType', this.evaluate?.value ?? '');
            if (this.imagesUpload?.files.length) {
                this.imagesUpload.files.forEach(item => {
                    formData.append('files', item.detail, item.detail.name);
                });
            }
            await this.enterHandle?.call(null, formData);
        }
        catch (e) {
            this.emiterror(e as Error);
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
