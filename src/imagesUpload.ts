import styles from  './assets/css/index.css';
let count = 0;
export default class ImagesUpload {
    constructor() {
        const description = document.createElement('p');
        description.className = styles.description;
        description.innerText = '提示：1、单个附件大小≤2M；2、附件个数≤4个';
        this.el = document.createElement('div');
        this.el.className = styles.upload;
        this.el.appendChild(this.createImageRow());
        this.el.appendChild(description);
    }
    createImageRow() {
        const wrap = document.createElement('div');
        const id = `${styles.upload}_${++count}`;
        const input = document.createElement('input');
        input.id = id;
        input.type = 'file';
        input.accept = 'image/*';
        input.style.display = 'none';
        input.onchange = e => {
            // wrap.innerHTML = '';
            Array(...e.target.files).forEach((file, index) => {
                const reader = new  FileReader();
                const addImage = (e) => {
                    console.log(e);
                    const isSuccess = e.type === 'load';
                    const image = document.createElement('div');
                    if (isSuccess) {
                        image.innerHTML = `<img src="${e.target.result}" alt="${file.name}"/>`;
                    }
                    image.setAttribute('title', file.name);
                    image.addEventListener('click', ({target}) => {
                        wrap.removeChild(target);
                        // input.files = input.files.filter(item => item !== file);
                    });
                    console.log(image);
                    wrap.appendChild(image);
                };
                console.log(file);
                reader.readAsDataURL(file);
                reader.addEventListener('load', addImage);
                reader.addEventListener('error', addImage);
            });
        };

        const label = document.createElement('label');
        label.setAttribute('for', id);

        wrap.className = styles.image_row;
        wrap.appendChild(input);
        wrap.appendChild(label);
        return wrap;
    }
}