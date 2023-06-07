import { FloatingLive } from "..";

/** 插件模块, 加载时调用 */
export type FloatingLivePlugin<T extends FloatingLive> = () => {
  register: (ctx: T, config?: {[key: string]: any}) => {[key: string]: any} | void
};
