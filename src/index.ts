import Modal from './modal';
import {Dropdown, Option} from './dropdown';
import {template2dom} from './utils';
import styles from  './assets/css/index.less';

class Entry {
    el = template2dom(`
        <div class="${styles.affix_wrap}">
            <div class="${styles.affix}">
                <span>咨<br/>询</span>
            </div>
        </div>
    ` )
    constructor() {
        const affix = this.el.querySelector(`.${styles.affix}`) as HTMLElement;
        const options: Option[] = [{
            text: '智能客服',
            handler() {
                console.log('智能客服');
            }
        },
        {
            text: '问题报错',
            modal: new Modal(this.el, '问题报错'),
            handler() {
                this.modal?.show();
            }
        },
        {
            text: '意见反馈',
            modal: new Modal(this.el, '意见反馈'),
            handler() {
                this.modal?.show();
            }
        }];
        if (affix) {
            new Dropdown(affix, options);
        }
    }
}

document.body.appendChild(new Entry().el);

export default () => {
    console.log('-------');
};
