import { FloatingLive } from "..";

/** 插件模块, 加载时调用 */
export type FloatingLivePlugin<T extends FloatingLive> = () => {
  /** 插件名称 */
  name: string;
  register: (ctx: T) => object | void;
  destroy?: (ctx: T) => void;
};
