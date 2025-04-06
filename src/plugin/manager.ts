import { CommonPluginContext } from "./context/CommonPluginContext";
import type { App } from "../app";
import { AppError, ErrorOptions } from "../error";
import {
  PluginItem,
  PluginConstructor,
  PluginContext,
  PluginRegisterOptions,
} from "./types";
import { CorePluginContext } from "./context/CorePluginContext";

export interface PluginData<T> {
  plugin: PluginItem;
  context: PluginContext;
  exposes?: T;
  core?: boolean;
}

export class PluginManager {
  /** 插件列表 */
  private list = new Map<string, PluginData<any>>();
  protected readonly app: App;

  constructor(app: App) {
    this.app = app;
  }

  registerSync<P extends PluginItem>(
    pluginConstructor: PluginConstructor<P>,
    options: Record<string, any> = {},
    { context, core }: PluginRegisterOptions = {}
  ): P {
    const pluginName = pluginConstructor.pluginName;
    if (!pluginName) {
      throw new AppError("plugin:register_id_missing", {
        message: "插件注册失败",
        cause: "插件缺少pluginName字段",
        target: "plugin/#unnamed",
      });
    }
    if (this.list.has(pluginName)) {
      throw new AppError("plugin:register_id_duplicate", {
        message: `插件注册失败: ${pluginName}`,
        cause: "已存在相同id的插件",
        target: `plugin/${pluginName}`,
      });
    }
    const registerCtx = { pluginName, options };

    const pluginCtx = context || new CorePluginContext(this.app, pluginName);
    try {
      const ctx = this.app.callHookSync("plugin.register", registerCtx);
      if (ctx.defaultPrevented)
        throw new AppError("plugin:register_hook_prevented", {
          message: `插件注册失败: ${pluginName}`,
          cause: "插件注册被钩子函数阻止",
          target: `plugin/${pluginName}`,
        });
      // 执行插件函数
      const plugin = new pluginConstructor(
        pluginCtx,
        registerCtx.options || {}
      );
      // 调用插件的init钩子
      plugin.init?.(pluginCtx, registerCtx.options || {});
      // 调用插件的expose钩子
      const exposes = plugin.expose?.(pluginCtx);
      this.list.set(pluginName, {
        plugin,
        context: pluginCtx,
        exposes,
        core,
      });
      this.app.emit("plugin:register", { pluginName });
      return plugin;
    } catch (err: any) {
      throw new AppError("plugin:register_fail", {
        message: `插件注册失败: ${pluginName}`,
        cause: err,
        target: `plugin/${pluginName}`,
      });
    }
  }

  /** 注册插件 */
  async register<P extends PluginItem>(
    pluginConstructor: PluginConstructor<P>,
    options: Record<string, any> = {},
    { context, core }: PluginRegisterOptions = {}
  ): Promise<P> {
    const pluginName = pluginConstructor.pluginName;
    if (!pluginName) {
      throw new AppError("plugin:register_id_missing", {
        message: "插件注册失败",
        cause: "插件缺少pluginName字段",
        target: "plugin/#unnamed",
      });
    }
    if (this.list.has(pluginName)) {
      throw new AppError("plugin:register_id_duplicate", {
        message: `插件注册失败: ${pluginName}`,
        cause: "已存在相同id的插件",
        target: `plugin/${pluginName}`,
      });
    }
    const registerCtx = { pluginName, options };

    const pluginCtx = context || new CommonPluginContext(this.app, pluginName);
    return await this.app
      .callHook("plugin.register", registerCtx)
      .then(async (ctx) => {
        if (ctx.defaultPrevented)
          throw new AppError("plugin:register_hook_prevented", {
            message: `插件注册失败: ${pluginName}`,
            cause: "插件注册被钩子函数阻止",
            target: `plugin/${pluginName}`,
          });
        // 执行插件函数
        const plugin = new pluginConstructor(
          pluginCtx,
          registerCtx.options || {}
        );
        // 调用插件的init钩子
        await plugin.init?.(pluginCtx, registerCtx.options || {});
        // 调用插件的expose钩子
        const exposes = await plugin.expose?.(pluginCtx);
        this.list.set(pluginName, {
          plugin,
          context: pluginCtx,
          exposes,
          core,
        });
        this.app.emit("plugin:register", { pluginName });
        return plugin;
      })
      .catch((err: any) => {
        throw new AppError("plugin:register_fail", {
          message: `插件注册失败: ${pluginName}`,
          cause: err,
          target: `plugin/${pluginName}`,
        });
      });
  }
  /** 移除插件 */
  async unregister(pluginName: string) {
    const pluginData = this.list.get(pluginName);
    // 检测插件是否存在
    if (!pluginData) {
      throw new AppError("plugin:unregister_unexist", {
        message: `插件移除失败: ${pluginName}`,
        cause: "插件不存在",
        target: `plugin/${pluginName}`,
      });
    } else {
      const { plugin, context, core } = pluginData;
      if (core) {
        throw new AppError("plugin:unregister_core", {
          message: `插件移除失败: ${pluginName}`,
          cause: "无法移除核心插件",
          target: `plugin/${pluginName}`,
        });
      }
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
