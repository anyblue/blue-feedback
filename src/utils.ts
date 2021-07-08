
const wrap = document.createElement('div');
export const template2dom = <T extends HTMLElement>(template: string) => {
    wrap.innerHTML = template;
    return wrap.children[0] as T;
}