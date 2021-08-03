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

class CountError extends Error {
    name = 'CountError';
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
            void this.setFiles(files);
        });
        // 禁止组件内的 dragover 的默认行为
        this.el.ondragover = () => false;
        this.addEventListener(this.label, 'drop', e => {
            e.preventDefault();
            const files = e.dataTransfer?.files ?? [];
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
                if (item.error) {
                    const errIndex = err ? priority.indexOf(err.name) : -1;
                    if (errIndex < 0 || errIndex > priority.indexOf(item.error.name)) {
                        return item.error;
                    }
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
        if (this.input) {
            this.input.value = '';
        }
    }
    unmounted(): void {
        this.clearEvent();
    }
    private async updateImages() {
        const wrap = this.el.getElementsByClassName(styles.image_row)[0];
        wrap.innerHTML = '';
        const results = await Promise.allSettled(this.files.map(this.readImage.bind(this)));
        results.forEach(res => {
            if (res.status === 'fulfilled') {
                wrap.appendChild(res.value);
            }
        });
        if (this.files.length < this.count) {
            wrap.appendChild(this.label);
        }
        this.emitchange();
    }
    private readImage(img: ImageFile, index: number) {
        const reader = new FileReader();
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
