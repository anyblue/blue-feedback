import styles from './assets/css/index.less';
import {template2dom, EventCleaner} from './utils';

export default class Textarea extends EventCleaner {
    el: HTMLElement;
    overflow = false;
    private readonly maxLength: number;
    private hint: HTMLElement|null;
    private textarea: HTMLTextAreaElement|null;
    constructor(params?: {placeholder?: string, maxLength?: number}) {
        super();
        const hintContent = (value: number) => `${value} / ${params?.maxLength ?? 0}`;
        this.el = template2dom(`
            <div class="${styles.textarea}">
                <textarea placeholder="${params?.placeholder ?? ''}" rows="3"></textarea>
                ${params?.maxLength ? `
                    <div class="${styles.textarea_hint}">${hintContent(0)}</div>
                ` : ''}
            </div>
        `);
        this.textarea = this.el.querySelector('textarea');
        this.hint = this.el.querySelector(`.${styles.textarea_hint}`);
        this.maxLength = params?.maxLength ?? 0;
        if (!this.textarea || !this.maxLength) {
            return;
        }
        this.addEventListener(this.textarea, 'change', this.changeHanler);
        this.addEventListener(this.textarea, 'input', this.changeHanler);
    }
    get value() {
        return this.textarea?.value ?? '';
    }
    set value(value: string) {
        if (this.textarea) {
            this.textarea.value = value;
            this.maxLength && this.updateValue(value.length);
        }
    }
    unmounted(): void {
        this.cleanEvent();
    }
    private hintContent(value: number): string {
        return `${value} / ${this.maxLength}`;
    }
    private readonly changeHanler = (e: Event|{target?: HTMLInputElement}): void => {
        const length = e.target && 'value' in e.target ? e.target.value.length : 0;
        this.updateValue(length);
    };
    private updateValue(length: number): void {
        if (this.hint) {
            this.hint.innerText = this.hintContent(length);
        }
        const elClassList = this.el.className.split(' ').map(item => item.trim());
        const errorIndex = elClassList.indexOf(styles.error);
        this.overflow = length > (this.maxLength ?? 0) && !!this.maxLength;
        if (errorIndex !== -1 && !this.overflow) {
            elClassList.splice(errorIndex, 1);
        }
        else if (errorIndex === -1 && this.overflow) {
            elClassList.push(styles.error);
        }
        else {
            return;
        }
        this.el.className = elClassList.join(' ');
    }
}
