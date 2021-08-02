import styles from './assets/css/index.less';
import {template2dom, EventCleaner} from './utils';
// 计数避免 id 冲突
let count = 0;

class StateError extends Error {
    name = 'StateError';
};
class SizeError extends Error {
    name = 'SizeError';
};
class FileTypeError extends Error {
    name = 'FileTypeError';
};
interface ImageFile {
    detail: File;
    error?: Error;
}
export default class ImagesUpload extends EventCleaner {
    files = [] as ImageFile[];
    el: HTMLElement;
    private readonly id = `${styles.upload}_${++count}`;
    private readonly label = template2dom(`<label class="${styles.image_row}" for="${this.id}"></label>`);
    private readonly count: number;
    private readonly itemSize: number;
    private input?: HTMLInputElement;
    private changeCallback?: (err: Error[]|null, length: number) => unknown;
    constructor(params?: {
        // 图片数量上限
        count: number;
        // 单个图片大小上限（单位：MB）
        itemSize: number;
    }) {
        super();
        this.count = params?.count ?? 4;
        this.itemSize = params?.itemSize ?? 2;
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
    onchange(cb: (err: Error[]|null, length: number) => unknown) {
        this.changeCallback = cb;
    }
    setFiles(value: FileList|File[], append = true): void {
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
    unmounted(): void {
        this.clearEvent();
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
        const addImage = (index: number, e: ProgressEvent<FileReader>) => {
            const file = e.target ? readerMap.get(e.target) : undefined;
            if (e.target) {
                readerMap.delete(e.target);
            }
            if (file) {
                const result = String(e.target?.result ?? '');
                const stateLegal = e.type === 'load';
                const sizeLegal = e.total < this.itemSize * Math.pow(2, 20);
                const typeLegal = result.startsWith('data:image/');
                const isSuccess = stateLegal && sizeLegal && typeLegal;
                const image = template2dom(`
                    <div
                        class="${isSuccess ? '' : styles.error}"
                        title="${file.detail.name}"
                        data-index="${index}">
                    ${isSuccess ? `<img src="${result}" alt="${file.detail.name}">` : ''}
                    </div>
                `);
                this.addEventListener(image, 'click', () => {
                    this.files = this.files.filter(item => item !== file);
                    this.updateImages();
                });
                wrap.appendChild(image);
                appendLabel();
                if (!stateLegal) {
                    this.emiterror(file.error = new StateError('文件解析失败'));
                }
                else if (!sizeLegal) {
                    this.emiterror(file.error = new SizeError('单个附件大小超过上限'));
                }
                else if (!typeLegal) {
                    this.emiterror(file.error = new FileTypeError('无法接受非图片附件'));
                }
            }
            if (index === this.files.length - 1) {
                // 在最末图片添加后，对 wrap 下的图片按 data-index 排序，label 标签排最后
                const children = new Array(...(wrap.children || []));
                children.sort((pre, now) => {
                    if (pre.tagName === 'LABEL') {
                        return 1;
                    }
                    if (now.tagName === 'LABEL') {
                        return -1;
                    }
                    return Number(pre.getAttribute('data-index')) - Number(now.getAttribute('data-index'));
                });
                wrap.innerHTML = '';
                children.forEach(item => wrap.appendChild(item));
                this.emitchange();
            }
        };
        this.files.forEach((file, index) => {
            const reader = new FileReader();
            readerMap.set(reader, file);
            reader.addEventListener('load', function loadHandle(e: ProgressEvent<FileReader>) {
                addImage(index, e);
                reader.removeEventListener('load', loadHandle);
            });
            reader.addEventListener('error', function errorHandle(e: ProgressEvent<FileReader>) {
                addImage(index, e);
                reader.removeEventListener('error', errorHandle);
            });
            reader.readAsDataURL(file.detail);
        });
        if (!this.files.length) {
            this.emitchange();
        }
    }
    private emitchange() {
        if (this.changeCallback) {
            const errors = this.files.reduce((list, item) => {
                if (item.error) {
                    list.push(item.error);
                }
                return list;
            }, [] as Error[]);
            this.changeCallback(errors.length ? errors : null, this.files.length);
        }
    }
}
