import Modal from './modal';
import {Dropdown, Option} from './dropdown';
import {template2dom} from './utils';
import styles from './assets/css/index.less';

export class Feedback {
    el = template2dom(`
        <div class="${styles.affix_wrap}">
            <div class="${styles.affix}">
                <span>咨<br/>询</span>
            </div>
        </div>
    `);
    private readonly dropdown?: Dropdown;
    constructor(params: {
        helperUrl?: string;
        defaultToast?: boolean;
        bugModel?: boolean;
        featureModel?: boolean;
    }) {
        const affix = this.el.querySelector(`.${styles.affix}`) as HTMLElement;
        const options: Option[] = [
            ...(params.helperUrl ? [{
                text: '智能客服',
                handler() {
                    params.helperUrl && (window.location.href = params.helperUrl);
                },
            }] : []),
            ...(params.bugModel !== false ? [{
                text: '问题报错',
                modal: new Modal(this.el, '问题报错', '请输入问题描述以及正确描述'),
                handler() {
                    this.modal?.show();
                },
            }] : []),
            ...(params.featureModel !== false ? [{
                text: '意见反馈',
                modal: new Modal(this.el, '意见反馈', '请输入您的建议/反馈'),
                handler() {
                    this.modal?.show();
                },
            }] : []),
        ];
        if (affix) {
            this.dropdown = new Dropdown(affix, options);
        }
        if (params.defaultToast !== false) {
            this.dropdown?.onerror(e => {
                const toast = template2dom(`<div class="${styles.error_toast} ${styles.hidden}">${e.message}</div>`);
                this.el.appendChild(toast);
                window.requestAnimationFrame(() => {
                    toast.className = styles.error_toast;
                });
                setTimeout(() => {
                    this.el.removeChild(toast);
                }, 2000);
            });
        }
        document.body.appendChild(this.el);

    }
    onerror(cb: (e: Error) => unknown) {
        this.dropdown?.onerror(cb);
    }
    // 用于清除后代绑定的事件监听
    unmounted(): void {
        this.dropdown?.unmounted();
    }
}

export default Feedback;
