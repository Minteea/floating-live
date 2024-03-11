import { FloatingLive } from "../live";
import { IPlugin, PluginConstructor } from "../types/plugin";

export class ModPlugin {
  /** 插件列表 */
  private list = new Map<string, IPlugin>();
  protected readonly main: FloatingLive;

  constructor(main: FloatingLive) {
    this.main = main;
  }
  /** 注册插件 */
  async register(
    pluginFunc: PluginConstructor,
    options: Record<string, any> = {}
  ) {
    const name = pluginFunc.pluginName;
    if (!name) {
      throw Object.assign(new TypeError("缺少插件id"), {
        from: "plugin",
        signal: "plugin_id_missing",
      });
    }
    if (this.list.has(name)) {
      throw Object.assign(new Error("插件id重复"), {
        from: "plugin",
        signal: "plugin_id_duplicate",
      });
    }
    return await this.main.hook
      .call("plugin.register", { name, options })
      .then(async (res) => {
        if (!res) return;
        // 执行插件函数
        const plugin = new pluginFunc(this.main, options);
        this.list.set(name, plugin);
        // 调用插件的register钩子
        await plugin.register?.(this.main, options);
        this.main.emit("plugin:add", name);
        return plugin;
      });
  }
  /** 移除插件 */
  async unregister(name: string) {
    const plugin = this.list.get(name);
    // 检测插件是否存在
    if (!plugin) {
      throw Object.assign(new Error("插件不存在"), {
        from: "plugin",
        signal: "plugin_unexist",
      });
    }
    // 调用该插件的destroy钩子
    await plugin.destroy?.();
    // 从列表中移除插件
    this.list.delete(name);
    // 移除插件注册
    this.main.emit("plugin:remove", name);
  }
  /** 获取插件实例 */
  get(name: string) {
    return this.list.get(name);
  }
}
