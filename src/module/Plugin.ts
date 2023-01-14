import { FloatingLive } from "..";

export class PluginHandler<T extends FloatingLive> {
  private current: string | null = null
  private list = new Map<string, {[key: string]: any}>()
  private pluginEvent = new Map<string, [string, (...args: any[]) => void][]>()
  private main: T
  private helper: FloatingLive["helper"]
  constructor(main: T) {
    this.main = main
    this.helper = main.helper
  }
  /** 获取当前安装插件 */
  get currentPlugin() {
    return this.current
  }
  addPluginEvent(eventName: string, listener: (...args: any[]) => void) {
    if (this.currentPlugin) {
      if (!this.pluginEvent.has(this.currentPlugin)) {
        this.pluginEvent.set(this.currentPlugin, [])
      }
      this.pluginEvent.get(this.currentPlugin)?.push([eventName, listener])
    }
  }
  /** 获取插件操作对象 */
  get(name: string) {
    return this.list.get(name)
  }
  /** 注册插件 */
  register(name: string, pluginFunc: (main: T) => {[key: string]: any} | void) {
    if (this.list.has(name)) {
      this.main.emit("plugin_duplicate", name)
      return
    }
    this.current = name;
    // 执行插件函数并获取插件操作对象
    let pluginObject = pluginFunc(this.main);
    this.list.set(name, pluginObject || {});
    // 执行钩子函数
    this.helper.pluginAddHandler.getList().forEach(handler => {
      handler(name)
    });
    this.main.emit("plugin_add", name);
    this.current = null;
    return pluginObject;
  }
  /** 移除插件 */
  unregister(name: string) {
    // 检测插件是否存在
    if (!this.list.has(name)) {
      this.main.emit("plugin_unexist", name);
      return;
    }
    // 获取该插件的销毁函数
    let destoryFunc = this.helper.pluginDestory.getIdByPlugin(name).map(
      id => this.helper.pluginDestory.get(id)
    )
    // 从列表中移除插件
    this.list.delete(name);
    // 移除helper注册
    this.helper.roomGenerator.unregister(name)
    this.helper.messageHandler.unregister(name)
    this.helper.pluginAddHandler.unregister(name)
    this.helper.pluginRemoveHandler.unregister(name)
    this.helper.pluginDestory.unregister(name)
    // 执行钩子函数
    this.helper.pluginRemoveHandler.getList().forEach(handler => {
      handler(name)
    });
    // 执行销毁函数
    destoryFunc.forEach(handler => {
      handler?.()
    })
    this.main.emit("plugin_remove", name);
  }
}