import { FloatingLive } from "..";
import { FloatingLivePlugin } from "../types/plugin";

export class ModPlugin<T extends FloatingLive> {
  private current: string | null = null;
  /** 插件列表 */
  private list = new Map<string, { [key: string]: any }>();
  private pluginEvent = new Map<string, [string, (...args: any[]) => void][]>();
  private main: T;
  private exports = new Map<string, object>();
  constructor(main: T) {
    this.main = main;
  }
  /** 获取当前安装插件 */
  get currentPlugin() {
    return this.current;
  }
  addPluginEvent(eventName: string, listener: (...args: any[]) => void) {
    if (this.currentPlugin) {
      if (!this.pluginEvent.has(this.currentPlugin)) {
        this.pluginEvent.set(this.currentPlugin, []);
      }
      this.pluginEvent.get(this.currentPlugin)?.push([eventName, listener]);
    }
  }
  /** 访问插件操作对象 */
  access(name: string) {
    return this.exports.get(name);
  }
  /** 注册插件 */
  register(pluginFunc: FloatingLivePlugin<T>, pluginConfig?: object) {
    // 执行插件函数
    const plugin = pluginFunc();
    const name = plugin.name;
    if (this.list.has(name)) {
      this.main.emit("plugin:duplicate", name);
      return;
    }
    this.list.set(name, plugin);
    this.current = name;
    // 调用register函数，并保存获取值
    let pluginExpose = plugin.register?.(this.main, pluginConfig) || {};
    this.exports.set(name, pluginExpose);
    this.main.emit("plugin:add", name);
    this.current = null;
    return pluginExpose;
  }
  /** 移除插件 */
  unregister(name: string) {
    const plugin = this.list.get(name);
    // 检测插件是否存在
    if (!plugin) {
      this.main.emit("plugin:unexist", name);
      return;
    }
    // 获取该插件的销毁函数
    plugin.destroy?.();
    // 从列表中移除插件
    this.list.delete(name);
    // 移除插件注册
    this.main.emit("plugin:remove", name);
  }
}
