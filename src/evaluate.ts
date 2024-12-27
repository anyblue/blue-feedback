import {template2dom, EventCleaner} from './utils/utils';

import styles from './assets/css/evaluate.less';

const DEFAULT_OPTIONS = [
    {
        label: '很好',
        value: 'satisfied',
        className: 'satisfied',
    },
    {
        label: '一般',
        value: 'normal',
        className: 'normal',
    },
    {
        label: '不好',
        value: 'dissatisfied',
        className: 'dissatisfied',
    },
];

export interface Option {
    label: string;
    value: string;
    className?: string;
}

export interface Params {
    options?: Option[];
}

export default class Evaluate extends EventCleaner {
    el: HTMLElement;
    options: Option[];
    selectOption: Option;
    private changeCallback?: () => unknown;

    constructor(params?: Params) {
        super();
        this.selectOption = {} as Option;
        this.options = params?.options?.length ? params.options : DEFAULT_OPTIONS;
        this.el = template2dom(`
            <div class="${styles.evaluate}">
                ${this.options.map(item => `
                    <div class="${styles.evaluate_item}" data-evaluate-type="${item.value}">
                        <div class="${item?.className ? styles[item.className] ?? item.className : ''}"></div>
                        <p>${item.label}</p>
                    </div>
                `).join('')}
            </div>
        `);

        this.addEventListener(this.el, 'click', event => {
            event.target as HTMLElement|null;
            const target = event.target as HTMLElement|null;
            const evaluateElement = target?.getAttribute('data-evaluate-type') !== null
                ? target : target?.parentElement;
            const value = evaluateElement?.getAttribute('data-evaluate-type') ?? '';
            this.selectItem(value);
        });
    }

    get value() {
        return this.selectOption?.value ?? '';
    }

    set value(value: string) {
        this.selectItem(value);
    }

    onchange(cb: () => unknown) {
        this.changeCallback = cb;
    }

    unmounted(): void {
        this.clearEvent();
    }

    private selectItem(value: string) {
        const option = this.options?.find(item => item.value === value) ?? {} as Option;
        const evaluateList = document.querySelectorAll(`.${styles.evaluate_item}`);
        evaluateList.forEach(item => {
            item.classList.remove(styles.evaluate_item_active);
            if (item.getAttribute('data-evaluate-type') === option.value) {
                item.classList.add(styles.evaluate_item_active);
            }
        });
        this.selectOption = option;
        this.changeCallback?.();
    }
}
