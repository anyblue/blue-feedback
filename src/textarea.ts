import styles from  './assets/css/index.less';
import {template2dom} from './utils';

export default class Textarea {
    maxLength = 0;
    el: HTMLElement;
    hint?: HTMLElement;
    textarea?: HTMLTextAreaElement;
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
        this.textarea = this.el.querySelector('textarea') as HTMLTextAreaElement|null ?? undefined;
        this.hint = this.el.querySelector(`.${styles.textarea_hint}`) as HTMLTextAreaElement|null ?? undefined;
        this.maxLength = params?.maxLength ?? 0;
        if (!this.textarea || !this.maxLength) {
            return;
        }
        this.textarea.addEventListener('change', (e: Event|{target?: HTMLInputElement}) => {
            const length = e.target && 'value' in e.target ? e.target.value.length : 0;
            this.update(length);
        });
        this.textarea.addEventListener('input', (e: Event|{target?: HTMLInputElement}) => {
            const length = e.target && 'value' in e.target ? e.target.value.length : 0;
            this.update(length);
        });
    }
    hintContent(value: number){
        return `${value} / ${this.maxLength}`;
    }
    setValue(value: string) {
        if (this.textarea) {
            this.textarea.value = value;
        }
    }
    update(length: number) {
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