import { FloatingLive } from "..";

/** 插件模块, 加载时调用 */
export type FloatingLivePlugin<
  C extends object = object,
  E extends object | void = object | void
> = () => {
  /** 插件名称 */
  name: string;
  register: (ctx: FloatingLive, config?: C) => E;
  destroy?: (ctx: FloatingLive) => void;
};
