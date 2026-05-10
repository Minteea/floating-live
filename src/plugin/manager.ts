import { CommonPluginContext } from "./context/CommonPluginContext";
import type { App } from "../app";
import { AppError, ErrorOptions } from "../error";
import {
  PluginItem,
  PluginConstructor,
  PluginContext,
  PluginRegisterOptions,
} from "./types";
import { bindCommand } from "../utils";

export interface PluginData<T> {
  plugin: PluginItem;
  context: PluginContext;
  exposes?: T;
  unremovable: boolean;
  /** 可访问App实例 */
  accessApp: boolean;
  /** 插件类型 */
  pluginType: "core" | "framework" | "";
}

/** 插件注册监听回调
 * 当目标插件已经注册时，回调会被立即调用，否则将在目标插件注册时调用。
 * 回调可以返回一个函数作为注销时的回调。
 */
export type WhenRegisterCallback = () => (() => void) | void;

export class PluginManager {
  /** 插件列表 */
  private list = new Map<string, PluginData<any>>();
  private whenRegisterMap = new Map<string, Map<WhenRegisterCallback, (() => void) | null>>();

  protected readonly app: App;

  constructor(app: App) {
    this.app = app;
    app.registerCommand("plugin.snapshot", bindCommand(this.toSnapshot, this));
  }

  registerSync<P extends PluginItem>(
    pluginConstructor: PluginConstructor<P>,
    options: Record<string, any> = {},
    { context, core, unremovable, accessApp, pluginType }: PluginRegisterOptions = {}
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

    const pluginCtx = context || new CommonPluginContext(this.app, pluginName);
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
      // 将插件数据注册到列表中
      this.list.set(pluginName, {
        plugin,
        context: pluginCtx,
        exposes,
        unremovable: core || unremovable || false,
        accessApp: core || accessApp || false,
        pluginType: core ? "core" : pluginType || "",
      });
      this.app.emit("plugin:register", { pluginName });

      // 如果有whenRegister的回调，调用回调函数
      const callbackMap = this.whenRegisterMap.get(pluginName);
      if (callbackMap) {
        for (const [callback] of callbackMap.entries()) {
          const whenUnregistered = callback();
          callbackMap.set(callback, whenUnregistered || null);
        }
      }

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
    { context, core, unremovable, accessApp, pluginType }: PluginRegisterOptions = {}
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
          unremovable: core || unremovable || false,
          accessApp: core || accessApp || false,
          pluginType: core ? "core" : pluginType || "",
        });
        this.app.emit("plugin:register", { pluginName });

        // 如果有whenRegister的回调，调用回调函数
        const callbackMap = this.whenRegisterMap.get(pluginName);
        if (callbackMap) {
          for (const [callback] of callbackMap.entries()) {
            const whenUnregistered = callback();
            callbackMap.set(callback, whenUnregistered || null);
          }
        }

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
      const { plugin, context, unremovable } = pluginData;
      if (unremovable) {
        throw new AppError("plugin:unregister_unremovable", {
          message: `插件移除失败: ${pluginName}`,
          cause: "不可移除的插件",
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

      // 如果有whenRegister的回调，调用whenUnregistered函数并将回调函数从列表中移除
      const callbackMap = this.whenRegisterMap.get(pluginName);
      if (callbackMap) {
        for (const [callback, whenUnregistered] of callbackMap.entries()) {
          whenUnregistered?.();
          callbackMap.delete(callback);
        }
      }
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
  /** 在插件已注册时执行回调
   * param skipError 在安装来源插件调用该方法且目标插件已安装时，是否跳过回调函数抛出的错误（默认为false）
   */
  whenRegister(pluginName: string, callback: WhenRegisterCallback /*, { skipError = false }: { skipError?: boolean } = {} */) {
    if (!this.whenRegisterMap.has(pluginName)) {
      // 如果目标插件的回调列表不存在，创建一个新的回调列表并添加回调函数
      this.whenRegisterMap.set(pluginName, new Map([[callback, null]]));
    } else {
      // 确保回调函数不重复注册，如果重复，则直接返回
      if (this.whenRegisterMap.get(pluginName)!.has(callback)) {
        return;
      }
      // 如果目标插件的回调列表已存在，直接添加回调函数
      this.whenRegisterMap.get(pluginName)!.set(callback, null);
    }
    // 如果目标插件已经注册，直接调用回调
    if (this.has(pluginName)) {
      const whenUnregistered = callback();
      this.whenRegisterMap.get(pluginName)!.set(callback, whenUnregistered || null);
    }
  }
  /** 取消插件已注册时的执行回调 */
  cancelWhenRegister(pluginName: string, callback: WhenRegisterCallback) {
    const callbackMap = this.whenRegisterMap.get(pluginName);
    if (callbackMap?.has(callback)) {
      const whenUnregistered = callbackMap.get(callback);
      // 如果存在注销目标插件时调用的回调函数，则调用它
      whenUnregistered?.();
      callbackMap.delete(callback);
    }
  }

  toSnapshot() {
    return [...this.list.keys()].map((n) => ({ pluginName: n }));
  }
}
