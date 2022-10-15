import FloatingLiving from "..";
declare class msgSave {
    /** 主模块 */
    main: FloatingLiving;
    file: string;
    config: object;
    type: string;
    paused: boolean;
    listener: (msg: any) => void;
    constructor(main: FloatingLiving, type: string, file: string, config?: {
        encoding: string;
        flag: string;
    });
    write(message: any): void;
    pause(): void;
    /** 更改路径 */
    changeFile(file: string): void;
    /** 销毁实例 */
    destory(): void;
}
export default msgSave;
