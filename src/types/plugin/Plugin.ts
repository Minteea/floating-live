import FloatingLive from "../..";

/** 插件模块, 加载时调用 */
export type FloatingLivePlugin<T = void> = (ctx: FloatingLive) => T;
