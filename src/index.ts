import styles from './assets/css/index.less';

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
    img?: Required<ModalOpt>['img']|true;
    text?: Required<ModalOpt>['text'];
}

export interface Params {
    defaultToast?: boolean;
    option: Array<EntryOpt_Link|EntryOpt_Modal>;
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
    private readonly dropdown?: Dropdown;
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
