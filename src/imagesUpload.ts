import styles from  './assets/css/index.less';
import {template2dom} from './utils';
// 计数避免 id 冲突
let count = 0;

class StateError extends Error {name = 'StateError'}
class SizeError extends Error {name = 'SizeError'}
class FileTypeError extends Error {name = 'FileTypeError'}

interface ImageFile {
    detail: File;
    error?: Error;
}
export default class ImagesUpload {
    id = `${styles.upload}_${++count}`;
    label = template2dom(`<label class="${styles.image_row}" for="${this.id}"></label>`);
    files = [] as ImageFile[];
    count = 4;
    itemSize = 2;
    el: HTMLElement
    input ?: HTMLInputElement;
    constructor(params?: {
        // 图片数量上限
        count: number;
        // 单个图片大小上限（单位：MB）
        itemSize: number;
    }) {
        if (params?.count) {
            this.count = params.count;
        }
        if (params?.itemSize) {
            this.itemSize = params.itemSize;
        }
        this.el = template2dom(`
            <div class="${styles.upload}">
                <div class="${styles.image_row}">
                </div>
                <input id="${this.id}" type="file" accept="image/*" style="display:none" multiple="multiple" />
                <p class="${styles.description}">提示：1、单个附件大小≤${this.itemSize}M；2、附件个数≤${this.count}个</p>
            </div>
        `);
        const input = this.el.querySelector(`#${this.id}`) as HTMLInputElement;
        if (!input) {
            return;
        }
        this.input = input;
        this.input.addEventListener('change', (e: Event|{target?: HTMLInputElement}) => {
            const files = e.target
                ? 'files' in e.target && e.target.files ? e.target.files : [] : [];
            this.setFiles(files);
        });
        // 禁止组件内的 dragover 的默认行为
        this.el.ondragover = () => false;
        this.label.addEventListener('drop', e => {
            e.preventDefault();
            const files = e.dataTransfer?.files ?? [];
            this.setFiles(files);
        });
        this.updateImages();
    }
    setFiles(value: FileList|File[]) {
        for (const file of value) {
            if (this.files.length >= this.count) {
                break;
            }
            this.files.push({detail: file});
        }
        this.files = this.files.slice(0, this.count);
        this.updateImages();
        if (this.input) {
            this.input.value = '';
        }
    }
    updateImages() {
        const wrap = this.el.getElementsByClassName(styles.image_row)[0];
        wrap.innerHTML = '';
        const appendLabel = () => {
            if (this.files.length < this.count) {
                wrap.appendChild(this.label);
            }
        };
        appendLabel();
        const addImage = function (this: ImagesUpload, file: ImageFile, e: ProgressEvent<FileReader>) {
            const result = String(e.target?.result ?? '');
            const stateLegal = e.type === 'load';
            const sizeLegal = e.total < this.itemSize * Math.pow(2, 20);
            const typeLegal = result.match(/^data:image\//);
            const isSuccess = stateLegal && sizeLegal && typeLegal;
            const image = template2dom(`
                <div class="${isSuccess ? '' : styles.error}" title="${file.detail.name}">
                ${isSuccess ? `<img src="${result}" alt="${file.detail.name}">` : ''}
                </div>
            `);
            if (!stateLegal) {
                file.error = new StateError('文件解析失败');
            }
            else if (!sizeLegal) {
                file.error = new SizeError('单个附件大小超过上限');
            }
            else if (!typeLegal) {
                file.error = new FileTypeError('无法接受非图片附件');
            }
            image.addEventListener('click', () => {
                this.files = this.files.filter(item => item !== file);
                this.updateImages();
            });
            wrap.appendChild(image);
            appendLabel();
        };
        this.files.forEach(file => {
            const reader = new  FileReader();
            reader.readAsDataURL(file.detail);
            reader.addEventListener('load', addImage.bind(this, file));
            reader.addEventListener('error', addImage.bind(this, file));
        });
    }
}
