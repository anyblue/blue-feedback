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
        bugModal?: boolean;
        featureModal?: boolean;
        send?(type: 'bug'|'feature', data: FormData): Promise<any>;
    } = {}) {
        const affix = this.el.querySelector(`.${styles.affix}`) as HTMLElement;
        const options: Option[] = [];
        if (params.helperUrl) {
            options.push({
                text: '智能客服',
                handler() {
                    params.helperUrl && (window.location.href = params.helperUrl);
                },
            });
        }
        if (params.bugModal !== false) {
            const modal = new Modal(this.el, '问题报错', '（必填）请输入问题描述以及正确描述');
            typeof params.send === 'function' && modal.onenter(params.send.bind(null, 'bug'));
            options.push({
                text: '问题报错',
                modal,
                handler() {
                    this.modal?.show();
                },
            });
        }
        if (params.featureModal !== false) {
            const modal = new Modal(this.el, '意见反馈', '（必填）请输入您的建议/反馈');
            typeof params.send === 'function' && modal.onenter(params.send.bind(null, 'feature'));
            options.push({
                text: '意见反馈',
                modal,
                handler() {
                    this.modal?.show();
                },
            });
        }
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
    // 用于移除组件并清除后代绑定的事件
    unmount(): void {
        document.body.removeChild(this.el);
        this.dropdown?.unmounted();
    }
}

export default Feedback;
