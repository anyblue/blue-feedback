import styles from './assets/css/index.less';
import {template2dom} from './utils';

export default class Textarea {
    el: HTMLElement;
    private readonly maxLength: number;
    private hint: HTMLElement|null;
    private textarea: HTMLTextAreaElement|null;
    constructor(params?: {placeholder?: string, maxLength?: number}) {
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
        this.textarea.addEventListener('change', this.changeHanler);
        this.textarea.addEventListener('input', this.changeHanler);
    }
    setValue(value: string): void {
        if (this.textarea) {
            this.textarea.value = value;
            this.updateValue(value.length);
        }
    }
    unmounted(): void {
        this.textarea?.removeEventListener('change', this.changeHanler);
        this.textarea?.removeEventListener('input', this.changeHanler);
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
        const overflow = length > (this.maxLength ?? 0);
        if (errorIndex !== -1 && !overflow) {
            elClassList.splice(errorIndex, 1);
        }
        else if (errorIndex === -1 && overflow) {
            elClassList.push(styles.error);
        }
        else {
            return;
        }
        this.el.className = elClassList.join(' ');
    }
}
