import { CommonPluginContext } from "./context/CommonPluginContext";
import type { App } from "../app";
import { AppError, ErrorOptions } from "../error";
import { PluginItem, PluginConstructor, PluginContext } from "./types";

export interface PluginErrorOptions extends ErrorOptions {
  pluginName: string;
}

export class PluginError extends AppError {
  pluginName: string;
  constructor(id: string, options: PluginErrorOptions) {
    super(id, options);
    this.pluginName = options.pluginName;
  }
}

export interface PluginData<T> {
  plugin: PluginItem;
  context: PluginContext;
  exposes?: T;
}

export class PluginManager {
  /** 插件列表 */
  private list = new Map<string, PluginData<any>>();
  protected readonly app: App;

  constructor(app: App) {
    this.app = app;
  }

  /** 注册插件 */
  async register(
    pluginConstructor: PluginConstructor,
    options: Record<string, any> = {}
  ) {
    const pluginName = pluginConstructor.pluginName;
    if (!pluginName) {
      throw new PluginError("plugin:register_id_missing", {
        message: "插件注册失败",
        cause: "插件缺少pluginName字段",
        pluginName: "",
      });
    }
    if (this.list.has(pluginName)) {
      throw new PluginError("plugin:register_id_duplicate", {
        message: `插件注册失败: ${pluginName}`,
        cause: "已存在相同id的插件",
        pluginName,
      });
    }
    const registerCtx = { pluginName, options };
    const pluginCtx = new CommonPluginContext(this.app, pluginName);
    return await this.app
      .callHook("plugin.register", registerCtx)
      .then(async (ctx) => {
        if (ctx.defaultPrevented) return;
        // 执行插件函数
        const plugin = new pluginConstructor(
          pluginCtx,
          registerCtx.options || {}
        );
        // 调用插件的register钩子
        await plugin.register?.(pluginCtx, registerCtx.options || {});
        // 调用插件的expose钩子
        const exposes = await plugin.expose?.(pluginCtx);
        this.list.set(pluginName, { plugin, context: pluginCtx, exposes });
        this.app.emit("plugin:register", { pluginName });
        return plugin;
      })
      .catch((err: any) => {
        throw new PluginError("plugin:register_fail", {
          message: `插件注册失败: ${pluginName}`,
          cause: err,
          pluginName,
        });
      });
  }
  /** 移除插件 */
  async unregister(pluginName: string) {
    const pluginData = this.list.get(pluginName);
    // 检测插件是否存在
    if (!pluginData) {
      throw new PluginError("plugin:unregister_unexist", {
        message: `插件移除失败: ${pluginName}`,
        cause: "插件不存在",
        pluginName,
      });
    } else {
      const { plugin, context } = pluginData;
      // 调用插件和上下文的destroy钩子
      plugin.destroy?.(context);
      context.destroy();
      // 从列表中移除插件
      this.list.delete(pluginName);
      // 移除插件注册事件
      this.app.emit("plugin:unregister", { pluginName });
    }
  }
  /** 获取插件实例 */
  get(pluginName: string) {
    return this.list.get(pluginName);
  }
  has(pluginName: string) {
    return this.list.has(pluginName);
  }
  getPlugin(pluginName: string) {
    return this.list.get(pluginName)?.plugin;
  }
  getExposes(pluginName: string) {
    return this.list.get(pluginName)?.exposes;
  }
  toData() {
    return [...this.list.keys()];
  }
}
