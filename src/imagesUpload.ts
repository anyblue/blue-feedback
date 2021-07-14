import styles from  './assets/css/index.less';
import {template2dom, EventCleaner} from './utils';
// 计数避免 id 冲突
let count = 0;

class StateError extends Error {name = 'StateError'}
class SizeError extends Error {name = 'SizeError'}
class FileTypeError extends Error {name = 'FileTypeError'}

interface ImageFile {
    detail: File;
    error?: Error;
}
export default class ImagesUpload extends EventCleaner {
    private id = `${styles.upload}_${++count}`;
    private label = template2dom(`<label class="${styles.image_row}" for="${this.id}"></label>`);
    private count = 4;
    private itemSize = 2;
    files = [] as ImageFile[];
    el: HTMLElement
    private input ?: HTMLInputElement;
    constructor(params?: {
        // 图片数量上限
        count: number;
        // 单个图片大小上限（单位：MB）
        itemSize: number;
    }) {
        super();
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
        this.addEventListener(this.input, 'change', (e: Event|{target?: HTMLInputElement}) => {
            const files = e.target
                ? 'files' in e.target && e.target.files ? e.target.files : [] : [];
            this.setFiles(files);
        });
        // 禁止组件内的 dragover 的默认行为
        this.el.ondragover = () => false;
        this.addEventListener(this.label, 'drop', e => {
            e.preventDefault();
            const files = e.dataTransfer?.files ?? [];
            this.setFiles(files);
        });
        this.updateImages();
    }
    private updateImages() {
        const wrap = this.el.getElementsByClassName(styles.image_row)[0];
        wrap.innerHTML = '';
        const appendLabel = () => {
            if (this.files.length < this.count) {
                wrap.appendChild(this.label);
            }
        };
        appendLabel();
        const readerMap = new Map<FileReader, ImageFile>();
        const addImage = (e: ProgressEvent<FileReader>) => {
            const file = e.target ? readerMap.get(e.target) : undefined;
            if (file) {
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
                this.addEventListener(image, 'click', () => {
                    this.files = this.files.filter(item => item !== file);
                    this.updateImages();
                });
                wrap.appendChild(image);
                appendLabel();
            }
            if (e.target) {
                e.target.removeEventListener('load', addImage);
                e.target.removeEventListener('error', addImage);
                readerMap.delete(e.target);
            }
        };
        this.files.forEach(file => {
            const reader = new  FileReader();
            readerMap.set(reader, file);
            reader.addEventListener('load', addImage);
            reader.addEventListener('error', addImage);
            reader.readAsDataURL(file.detail);
        });
    }
    setFiles(value: FileList|File[], append = true) {
        if (!append) {
            this.files = [];
        } 
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
    unmounted() {
        this.cleanEvent();
    }
}
