
const wrap = document.createElement('div');
export const template2dom = <T extends HTMLElement>(template: string): T => {
    wrap.innerHTML = template;
    return wrap.children[0] as T;
};

const errHandlers: Array<(e: Error) => unknown> = [];
export abstract class EventCleaner {
    private readonly eventMap = new Map <HTMLElement, Set<{
        name: keyof HTMLElementEventMap;
        cb(e: HTMLElementEventMap[keyof HTMLElementEventMap]): unknown;
    }>>();
    addEventListener<T extends keyof HTMLElementEventMap>(
        el: HTMLElement,
        name: T,
        cb: (e: HTMLElementEventMap[T]) => unknown
    ): void {
        el.addEventListener(name, cb);
        const events = this.eventMap.get(el);
        const handler: typeof cb = e => {
            try {
                cb(e);
            }
            catch (error) {
                this.emiterror(error);
            }
        };
        if (events) {
            events.add({name, cb: handler});
        }
        else {
            this.eventMap.set(el, new Set([{name, cb: handler}]));
        }
    }
    cleanEvent(): void {
        for (const [dom, events] of Array.from(this.eventMap)) {
            for (const {name, cb} of events) {
                dom.removeEventListener(name, cb);
            }
        }
        this.eventMap.clear();
    }
    onerror(cb: (e: Error) => unknown) {
        errHandlers.push(cb);
    }
    protected emiterror(error: Error) {
        errHandlers.forEach(cb => {
            try {
                cb(error);
            }
            catch (e) {
                // 避免回调中的异常影响分发
            }
        });
    }
}
