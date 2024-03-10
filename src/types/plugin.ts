import { FloatingLive } from "../live";

/** 插件模块, 加载时调用 */
export type FloatingLivePlugin<C extends object = object> = () => {
  /** 插件名称 */
  name: string;
  register: (ctx: FloatingLive, config?: C) => void;
  destroy?: (ctx: FloatingLive) => void;
};

export interface IPlugin {
  destroy?(): void;
}

export interface PluginConstructor {
  pluginName: string;
  new (ctx: FloatingLive, config: any): IPlugin;
}
