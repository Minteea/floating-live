import { FloatingLive } from "../live";

/** 插件模块, 加载时调用 */
export type FloatingLivePlugin<C extends object = object> = () => {
  /** 插件名称 */
  name: string;
  register: (ctx: FloatingLive, options?: C) => void;
  destroy?: (ctx: FloatingLive) => void;
};

export interface IPlugin {
  register?(ctx: FloatingLive, options: any): void | Promise<void>;
  destroy?(): void | Promise<void>;
  [name: string]: any;
}

export interface PluginConstructor {
  pluginName: string;
  new (ctx: FloatingLive, options: any): IPlugin;
}
