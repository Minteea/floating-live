import FloatingLive from "../..";

/** 插件模块, 加载时调用 */
export type FLivePlugin<T = void> = (ctx: FloatingLive) => T;
