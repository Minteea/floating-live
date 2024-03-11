import { FloatingLive } from "../live";

/** 插件对象 */
export interface PluginItem {
  pluginName?: string;
  register?(ctx: FloatingLive, options: any): void | Promise<void>;
  destroy?(): void | Promise<void>;
  [name: string]: any;
}

/** 插件构造器 */
export interface PluginConstructor {
  pluginName: string;
  new (ctx: FloatingLive, options: any): PluginItem;
}
