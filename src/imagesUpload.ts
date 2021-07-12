import styles from  './assets/css/index.less';
import {template2dom} from './utils';
let count = 0;
export default class ImagesUpload {
    id = `${styles.upload}_${++count}`;
    el = template2dom(`
        <div class="${styles.upload}">
            <div class="${styles.image_row}">
            </div>
            <input id="${this.id}" type="file" accept="image/*" style="display:none" multiple="multiple" />
            <p class="${styles.description}">提示：1、单个附件大小≤2M；2、附件个数≤4个</p>
        </div>
    `);
    files = [] as File[];
    input?: HTMLInputElement;
    count = 4;
    itemSize = 2048;
    constructor() {
        const input = this.el.querySelector(`#${this.id}`) as HTMLInputElement;
        if (!input) {
            return;
        }
        this.input = input;
        input?.addEventListener('change', (e: Event|{target?: HTMLInputElement}) => {
            const files = e.target
                ? 'files' in e.target && e.target.files ? e.target.files : [] : [];
            this.files = [...this.files, ...files].slice(0, this.count);
            this.updateImages();
            if (e.target && 'value' in e.target) {
                e.target.value = '';
            }
        });
        this.updateImages();
    }
    updateImages() {
        const wrap = this.el.getElementsByClassName(styles.image_row)[0];
        wrap.innerHTML = '';
        const label = template2dom(`<label class="${styles.image_row}" for="${this.id}"></label>`);
        wrap.appendChild(label);
        const appendLabel = (isFirst = false) => {
            if (this.files.length < this.count) {
                wrap.appendChild(label);
            }
            else if (isFirst) {
                wrap.removeChild(label);
            }
        };
        appendLabel(true);
        const addImage = function (this: ImagesUpload, file: File, e: ProgressEvent<FileReader>) {
            const result = String(e.target?.result ?? '');
            const stateLegal = e.type === 'load';
            const sizeLegal = Math.ceil(e.total / 1000) < this.itemSize;
            const typeLegal = result.match(/^data:image\//);
            const isSuccess = stateLegal && sizeLegal && typeLegal;
            const image = template2dom(`
                <div class="${isSuccess ? '' : styles.error}" title="${file.name}">
                ${isSuccess ? `<img src="${result}" alt="${file.name}">` : ''}
                </div>
            `);
            image.addEventListener('click', () => {
                this.files = this.files.filter(item => item !== file);
                this.updateImages();
            });
            wrap.appendChild(image);
            appendLabel();
        };
        this.files.forEach(file => {
            const reader = new  FileReader();
            reader.readAsDataURL(file);
            reader.addEventListener('load', addImage.bind(this, file));
            reader.addEventListener('error', addImage.bind(this, file));
        });

    }
}