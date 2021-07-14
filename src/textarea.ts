import styles from  './assets/css/index.less';
import {template2dom} from './utils';

export default class Textarea {
    private maxLength = 0;
    private hint?: HTMLElement;
    private textarea?: HTMLTextAreaElement;
    el: HTMLElement;
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
        this.textarea.addEventListener('change', this.changeHanler);
        this.textarea.addEventListener('input', this.changeHanler);
    }
    private hintContent(value: number){
        return `${value} / ${this.maxLength}`;
    }
    private changeHanler =  (e: Event|{target?: HTMLInputElement}) => {
        const length = e.target && 'value' in e.target ? e.target.value.length : 0;
        this.updateValue(length);
    }
    private updateValue (length: number) {
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
    setValue(value: string) {
        if (this.textarea) {
            this.textarea.value = value;
            this.updateValue(value.length);
        }
    }
    unmounted() {
        this.textarea?.removeEventListener('change', this.changeHanler);
        this.textarea?.removeEventListener('input', this.changeHanler);
    }
}
