import { FloatingLive } from "../live";
import { PluginConstructor } from "../types/plugin";

export class ModPlugin {
  /** 插件列表 */
  private list = new Map<string, { [key: string]: any }>();
  protected readonly main: FloatingLive;

  constructor(main: FloatingLive) {
    this.main = main;
  }
  /** 注册插件 */
  register(pluginFunc: PluginConstructor, options?: any) {
    const name = pluginFunc.pluginName;
    if (!name) {
      this.main.throw(
        Object.assign(new TypeError("缺少插件id"), {
          from: "plugin",
          signal: "plugin_id_missing",
        })
      );
      return;
    }
    if (this.list.has(name)) {
      this.main.throw(
        Object.assign(new Error("插件id重复"), {
          from: "plugin",
          signal: "plugin_id_duplicate",
        })
      );
      return;
    }
    return this.main.hook
      .call("plugin.register", { name, options })
      .then((res) => {
        if (!res) return;
        // 执行插件函数
        const plugin = new pluginFunc(this.main, options);
        this.list.set(name, plugin);
        // 调用插件的register钩子
        plugin.register?.(this.main, options);
        this.main.emit("plugin:add", name);
      });
  }
  /** 移除插件 */
  unregister(name: string) {
    const plugin = this.list.get(name);
    // 检测插件是否存在
    if (!plugin) {
      this.main.throw(
        Object.assign(new Error("插件不存在"), {
          from: "plugin",
          signal: "plugin_unexist",
        })
      );
      return;
    }
    // 调用该插件的destroy钩子
    plugin.destroy?.();
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
