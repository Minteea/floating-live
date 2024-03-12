import { FloatingLive } from "../live";
import { PluginItem, PluginConstructor } from "../types/plugin";

export class ModPlugin {
  /** 插件列表 */
  private list = new Map<string, PluginItem>();
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
      this.main.throw({
        message: "添加插件失败",
        reason: "缺少插件id",
        id: "plugin:register_id_missing",
      });
    }
    if (this.list.has(name)) {
      this.main.throw({
        message: `添加插件失败: ${name}`,
        reason: "已存在相同id的插件",
        id: "plugin:register_id_duplicate",
        pluginName: name,
      });
    }
    return await this.main.hook
      .call("plugin.register", { name, options })
      .then(async (res) => {
        if (!res) return;
        // 执行插件函数
        const plugin = new pluginFunc(this.main, options);
        // 调用插件的register钩子
        await plugin.register?.(this.main, options);
        this.list.set(name, plugin);
        this.main.emit("plugin:add", name);
        return plugin;
      })
      .catch((err) => {
        this.main.throw({
          message: `添加插件失败: ${name}`,
          reason:
            err?.message && err?.reason
              ? `${err.message}: ${err.reason}`
              : err?.message || err?.reason,
          id: "plugin:register_fail",
          pluginName: name,
        });
      });
  }
  /** 移除插件 */
  async unregister(name: string) {
    const plugin = this.list.get(name);
    // 检测插件是否存在
    if (!plugin) {
      this.main.throw({
        message: `移除插件失败: ${name}`,
        reason: "插件不存在",
        id: "plugin:unregister_unexist",
        pluginName: name,
      });
    } else {
      // 调用该插件的destroy钩子
      await plugin.destroy?.();
      // 从列表中移除插件
      this.list.delete(name);
      // 移除插件注册
      this.main.emit("plugin:remove", name);
    }
  }
  /** 获取插件实例 */
  get(name: string) {
    return this.list.get(name);
  }
  has(name: string) {
    return this.list.has(name);
  }
  getSnapshot() {
    return [...this.list.keys()];
  }
}
