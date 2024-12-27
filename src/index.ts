import 'core-js/modules/es.promise.all-settled';
import styles from './assets/css/index.less';
import toastStyles from './assets/css/errorToast.less';

import Modal, {Params as ModalOpt} from './modal';
import {Dropdown, Option} from './dropdown';
import {template2dom} from './utils/utils';

interface EntryOpt_Link {
    type: 'link';
    title: string;
    url: string;
}
interface EntryOpt_Modal {
    type: 'modal';
    title: string;
    value?: string;
    evaluate?: Required<ModalOpt>['evaluate']|true;
    img?: Required<ModalOpt>['img']|true;
    text?: Required<ModalOpt>['text'];
}

export interface Params {
    option: Array<EntryOpt_Link|EntryOpt_Modal>;
    toast?(err: Error): false|string|void;
    send?(type: string, data: FormData): Promise<any>;
}
export class Feedback {
    el = template2dom(`
        <div class="${styles.affix_wrap}">
            <div class="${styles.affix}">
                <span>咨询</span>
            </div>
        </div>
    `);
    private readonly dropdown: Dropdown;
    constructor(params: Params) {
        const affix = this.el.querySelector(`.${styles.affix}`) as HTMLElement;
        const options = params.option.reduce((list, item) => {
            if (item.type === 'link') {
                list.push({
                    text: item.title,
                    handler() {
                        item.url && (window.location.href = item.url);
                    },
                });
            }
            else if (item.type === 'modal') {
                const modalOpt: ModalOpt = {
                    title: item.title,
                    text: item.text,
                };
                if (item.evaluate) {
                    modalOpt.evaluate = item.evaluate === true ? {
                        options: [],
                    } : item.evaluate;
                }
                if (item.img) {
                    modalOpt.img = item.img === true ? {
                        count: 4,
                        itemSize: 2,
                    } : item.img;
                }
                const modal = new Modal(this.el, modalOpt);
                typeof params.send === 'function' && modal.onenter(params.send.bind(null, item.value || item.title));
                list.push({
                    text: item.title,
                    modal,
                    handler() {
                        this.modal?.show();
                    },
                });
            }
            return list;
        }, [] as Option[]);
        this.dropdown = new Dropdown(affix, options);
        this.dropdown.onerror(e => {
            const errMessage = params.toast?.(e) ?? e.message;
            if (errMessage !== false) {
                const toast = template2dom(`
                    <div class="${toastStyles.error_toast} ${toastStyles.hidden}">
                        ${String(errMessage)}
                    </div>
                `);
                this.el.appendChild(toast);
                window.requestAnimationFrame(() => {
                    toast.className = toastStyles.error_toast;
                });
                setTimeout(() => {
                    this.el.removeChild(toast);
                }, 2000);
            }
        });
        document.body.appendChild(this.el);
    }
    // 用于移除组件并清除后代绑定的事件
    unmount(): void {
        document.body.removeChild(this.el);
        this.dropdown.unmounted();
    }
}

export default Feedback;
