import { App } from "../../app";
import {
  AppCommandMap,
  CommandCallOptions,
  CommandFunction,
  CommandOptions,
} from "../../command";
import { AppError } from "../../error";
import { AppEventDetailMap, AppEventEmitOptions } from "../../event";
import {
  AppHookMap,
  HookCallOptions,
  HookContext,
  HookFunction,
  HookUseOptions,
} from "../../hook";
import {
  PluginConstructor,
  PluginContext,
  PluginItem,
  PluginInitOptions,
} from "../types";
import { CommonPluginContext } from "./CommonPluginContext";

export interface PluginPermissions {
  "plugin.register"?: boolean;
  "event.emit"?: string[];
  "event.emit.advanced"?: boolean;
  "command.register"?: string[];
  "command.call"?: string[];
  "command.call.advanced"?: boolean;
  "value.register"?: string[];
  "hook.use"?: string[];
  "hook.call"?: string[];
}

export class SafePluginContext extends CommonPluginContext {
  get safe() {
    return true;
  }
  #permissions: PluginPermissions = {};

  constructor(
    app: App,
    pluginName: string,
    options: { permissions: PluginPermissions }
  ) {
    super(app, pluginName);
    this.#permissions = options.permissions;
  }

  private throwNotPermitted(permission: string, cause: string) {
    this.throw(
      new AppError("plugin:no_permission", {
        message: "插件权限不足",
        cause,
        permission,
      })
    );
  }

  register(plugin: PluginConstructor, options?: PluginInitOptions): void {
    if (!this.#permissions["plugin.register"]) {
      this.throwNotPermitted("plugin.register", "无插件安装权限");
    }
    return super.register(plugin, options);
  }
  unregister(pluginName: string): void {
    if (!this.#permissions["plugin.register"]) {
      this.throwNotPermitted("plugin.register", "无插件安装权限");
    }
    return super.unregister(pluginName);
  }
  emit<K extends keyof AppEventDetailMap>(
    type: K,
    detail: AppEventDetailMap[K],
    options?: AppEventEmitOptions & EventInit
  ): void {
    if (
      !(
        this.#permissions["event.emit.advanced"] ||
        this.#permissions["event.emit"]?.includes(type)
      )
    ) {
      this.throwNotPermitted(`event.emit:${type}`, `无事件[${type}]的发送权限`);
    }
    if (!this.#permissions["event.emit.advanced"] && options) {
      this.throwNotPermitted("event.emit.advanced", `无事件高级发送权限`);
    }
    return super.emit(type, detail, options);
  }
  call<T extends keyof AppCommandMap>(
    name: T,
    ...args: Parameters<AppCommandMap[T]>
  ): ReturnType<AppCommandMap[T]> {
    if (
      !(
        this.#permissions["command.call.advanced"] ||
        this.#permissions["command.call"]?.includes(name)
      )
    ) {
      this.throwNotPermitted(
        `command.call:${name}`,
        `无命令[${name}]的调用权限`
      );
    }
    return super.call(name, ...args);
  }
  callWithOptions<T extends keyof AppCommandMap>(
    name: T,
    options: CommandCallOptions,
    ...args: Parameters<AppCommandMap[T]>
  ): ReturnType<AppCommandMap[T]> {
    if (!this.#permissions["command.call.advanced"]) {
      this.throwNotPermitted("command.call.advanced", "无命令高级调用权限");
    }
    return super.callWithOptions(name, options, ...args);
  }
  registerCommand<T extends keyof AppCommandMap>(
    name: T,
    func: CommandFunction<AppCommandMap[T]>,
    options?: CommandOptions
  ): void {
    if (!this.#permissions["command.register"]?.includes(name)) {
      this.throwNotPermitted(
        `command.call:${name}`,
        `无命令[${name}]的注册权限`
      );
    }
    return super.registerCommand(name, func, options);
  }
  useHook<T extends keyof AppHookMap>(
    name: T,
    func: HookFunction<AppHookMap[T]>,
    options?: HookUseOptions
  ): void {
    if (!this.#permissions["hook.use"]?.includes(name)) {
      this.throwNotPermitted(`hook.use:${name}`, `无钩子[${name}]的挂载权限`);
    }
    return super.useHook(name, func, options);
  }
  unuseHook<T extends keyof AppHookMap>(
    name: T,
    func: HookFunction<AppHookMap[T]>
  ): void {
    if (!this.#permissions["hook.use"]?.includes(name)) {
      this.throwNotPermitted(`hook.use:${name}`, `无钩子[${name}]的挂载权限`);
    }
    return super.unuseHook(name, func);
  }
  callHook<T extends keyof AppHookMap>(
    name: T,
    ctx: AppHookMap[T],
    options?: HookCallOptions
  ): Promise<HookContext<AppHookMap[T]>> {
    if (!this.#permissions["hook.call"]?.includes(name)) {
      this.throwNotPermitted(`hook.call:${name}`, `无钩子[${name}]的调用权限`);
    }
    return super.callHook(name, ctx);
  }
}
