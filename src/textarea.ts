import styles from './assets/css/index.less';
import {template2dom, EventCleaner} from './utils';

class OverflowError extends Error {
    name = 'OverflowError';
};
export default class Textarea extends EventCleaner {
    el: HTMLElement;
    overflow = false;
    private readonly maxLength: number;
    private hint: HTMLElement|null;
    private textarea: HTMLTextAreaElement|null;
    private changeCallback?: (err: Error|null, length: number) => unknown;
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
        this.addEventListener(this.textarea, 'change', () => {
            if (this.overflow) {
                this.emiterror(new OverflowError('超过字数限制'));
            }
        });
        this.addEventListener(this.textarea, 'input', (e: Event|{target?: HTMLInputElement}) => {
            const length = e.target && 'value' in e.target ? e.target.value.length : 0;
            this.updateValue(length);
        });
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
    onchange(cb: (err: Error|null, length: number) => unknown) {
        this.changeCallback = cb;
    }
    unmounted(): void {
        this.clearEvent();
    }
    private hintContent(value: number): string {
        return `${value} / ${this.maxLength}`;
    }
    private updateValue(length: number): void {
        if (this.hint) {
            this.hint.innerText = this.hintContent(length);
        }
        const elClassList = this.el.className.split(' ').map(item => item.trim());
        const errorIndex = elClassList.indexOf(styles.error);
        this.overflow = length > (this.maxLength ?? 0) && !!this.maxLength;
        this.changeCallback?.(this.overflow ? new OverflowError('超过字数限制') : null, length);
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
