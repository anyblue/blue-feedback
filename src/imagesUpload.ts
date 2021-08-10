import {template2dom, EventCleaner} from './utils/utils';
import {CountError, FileTypeError, StateError, SizeError} from './utils/error';
import styles from './assets/css/imagesUpload.less';
interface ImageFile {
    detail: File;
    error?: Error;
}

export interface Params {
    count: number; // 图片数量上限
    itemSize: number; // 单个图片大小上限（单位：MB）
}

let index = 0; // 计数避免 id 冲突
export default class ImagesUpload extends EventCleaner {
    files = [] as ImageFile[];
    el: HTMLElement;

    private readonly id = `${styles.upload}_${++index}`;
    private readonly label = template2dom(`<label class="${styles.image_row}" for="${this.id}"></label>`);
    private readonly count: number;
    private readonly itemSize: number;
    private input: HTMLInputElement;
    private placeholder: HTMLElement;
    private changeCallback?: (err: Error[]|null, length: number) => unknown;

    constructor(params: Params) {
        super();
        this.count = params.count;
        this.itemSize = params.itemSize;

        this.el = template2dom(`
            <div class="${styles.upload}">
                <div class="${styles.image_row}">
                </div>
                <input id="${this.id}" type="file" accept="image/*" style="display:none" multiple="multiple" />
                <div class="${styles.placeholder}">
                    <label for="${this.id}"></label>
                    <p class="${styles.title}">点击图标或拖拽上传</p>
                    <p class="${styles.description}">提示：1、单张图片大小≤${this.itemSize}M；2、图片数量≤${this.count}张</p>
                </div>
            </div>
        `);
        this.el.ondragover = () => false; // 禁止组件内的 dragover 的默认行为
        this.addEventListener(this.el, 'drop', e => {
            e.preventDefault();
            const files = e.dataTransfer?.files ?? [];
            void this.setFiles(files);
        });

        this.placeholder = this.el.querySelector(`.${styles.placeholder}`) as HTMLElement;

        this.input = this.el.querySelector(`#${this.id}`) as HTMLInputElement;
        this.addEventListener(this.input, 'change', (e: Event|{target?: HTMLInputElement}) => {
            const files = e.target
                ? 'files' in e.target && e.target.files ? e.target.files : [] : [];
            void this.setFiles(files);
        });

        void this.updateImages();
    }

    onchange(cb: (err: Error[]|null, length: number) => unknown) {
        this.changeCallback = cb;
    }

    async setFiles(value: FileList|File[], append = true) {
        if (!append) {
            this.files = [];
        }
        if (value.length + this.files.length <= this.count) {
            for (const file of value) {
                this.files.push({detail: file});
            }
            await this.updateImages();
            // 报错优先级 SizeError > FileTypeError > StateError
            const priority = ['SizeError', 'FileTypeError', 'StateError'];
            const error = this.files.slice(-value.length).reduce((err, item) => {
                const preIndex = err ? priority.indexOf(err.name) : -1;
                const itemIndex = item.error ? priority.indexOf(item.error.name) : -1;
                if (item.error && itemIndex >= 0 && (itemIndex < preIndex || preIndex < 0)) {
                    return item.error;
                }
                return err;
            }, null as Error|null);
            if (error) {
                this.emiterror(error);
            }
        }
        else {
            this.emiterror(new CountError('图片数量超过上限'));
        }
        this.input.value = '';
    }

    unmounted(): void {
        this.clearEvent();
    }

    private async updateImages() {
        const wrap = this.el.getElementsByClassName(styles.image_row)[0];
        wrap.innerHTML = '';
        this.placeholder.className = `${styles.placeholder} ${this.files.length ? styles.hidden : ''}`;
        const results = await Promise.allSettled(this.files.map(this.readImage.bind(this)));
        results.forEach(res => {
            if (res.status === 'fulfilled') {
                wrap.appendChild(res.value);
            }
        });

        if (this.files.length < this.count && this.files.length > 0) {
            wrap.appendChild(this.label);
        }

        this.emitchange();
    }

    private readImage(img: ImageFile, index: number) {
        const addImage = (e: ProgressEvent<FileReader>) => {
            const result = String(e.target?.result ?? '');
            const stateLegal = e.type === 'load';
            const sizeLegal = e.total < this.itemSize * Math.pow(2, 20);
            const typeLegal = result.startsWith('data:image/');
            const isSuccess = stateLegal && sizeLegal && typeLegal;
            const image = template2dom(`
                <div
                    class="${isSuccess ? '' : styles.error}"
                    title="${img.detail.name}"
                    data-index="${index}">
                ${isSuccess ? `<img src="${result}" alt="${img.detail.name}">` : ''}
                </div>
            `);
            this.addEventListener(image, 'click', () => {
                this.files = this.files.filter(item => item !== img);
                void this.updateImages();
            });
            if (!stateLegal) {
                img.error = new StateError('图片解析失败');
            }
            else if (!typeLegal) {
                img.error = new FileTypeError('无法接受非图片附件');
            }
            else if (!sizeLegal) {
                img.error = new SizeError('单个图片大小超过上限');
            }
            return image;
        };

        const reader = new FileReader();

        return new Promise<HTMLElement>(resolve => {
            reader.addEventListener('load', function loadHandle(e: ProgressEvent<FileReader>) {
                reader.removeEventListener('load', loadHandle);
                resolve(addImage(e));
            });
            reader.addEventListener('error', function errorHandle(e: ProgressEvent<FileReader>) {
                reader.removeEventListener('error', errorHandle);
                resolve(addImage(e));
            });
            reader.readAsDataURL(img.detail);
        });
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
