import type {Params} from './src/index'
export declare class Feedback {
    constructor(params: Params)
    el: HTMLElement;
    unmounted(): void;
    onerror(e: Error): void;
}
export type Data = Params;

export default Feedback;
