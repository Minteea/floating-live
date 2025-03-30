import { App } from "../../app";
import type {
  CommandOptions,
  CommandCallOptions,
  CommandFunction,
  AppCommandMap,
} from "../../command";
import { AppError, ErrorOptions } from "../../error";
import {
  AppEventListener,
  AppEventEmitOptions,
  AppEventDetailMap,
} from "../../event";
import {
  HookUseOptions,
  HookCallOptions,
  AppHookMap,
  HookFunction,
  HookContext,
} from "../../hook";
import { AppValueMap, ValueOptions } from "../../value";
import type {
  PluginContext,
  PluginConstructor,
  PluginInitOptions,
  AppPluginExposesMap,
} from "../types";

class ListMap<K, V> extends Map<K, Set<V>> {
  addItem(key: K, value: V) {
    const list = this.get(key);
    if (list) {
      list.add(value);
    } else {
      this.set(key, new Set([value]));
    }
  }
  deleteItem(key: K, value: V) {
    this.get(key)?.delete(value);
  }
}

export class CommonPluginContext implements PluginContext {
  get safe() {
    return false;
  }

  /** 主程序，插件不可访问 */
  #app: App;

  #registered = {
    plugins: new Set<string>(),
    values: new Set<string>(),
    commands: new Set<string>(),
    hooks: new ListMap<string, (ctx: any) => any>(),
    events: new ListMap<string, AppEventListener<any>>(),
  };

  getRegisteredPlugins() {
    return [...this.#registered.plugins];
  }

  /** 插件名称 */
  readonly pluginName: string;
  constructor(app: App, pluginName: string) {
    this.#app = app;
    this.pluginName = pluginName;
  }

  /** 抛出错误
   *
   * 一般用于自身导致的错误，若非插件本身导致的错误，使用throw语句即可
   */
  throw(err: AppError) {
    err.source ??= `plugin:${this.pluginName}`;
    throw err;
  }

  error(id: string, options: ErrorOptions) {
    return new AppError(id, options);
  }

  register(plugin: PluginConstructor, options?: PluginInitOptions): void {
    try {
      this.#app.register(plugin, options);
      this.#registered.plugins.add(plugin.name);
    } catch (err: any) {
      this.throw(err);
    }
  }

  unregister(pluginName: string): void {
    try {
      this.#app.unregister(pluginName);
      this.#registered.plugins.delete(pluginName);
    } catch (err: any) {
      this.throw(err);
    }
  }

  getPluginExposes<K extends keyof AppPluginExposesMap>(
    pluginName: K
  ): AppPluginExposesMap[K] {
    return this.#app.getPluginExposes(pluginName);
  }

  whenRegister<T>(
    pluginName: string,
    callback: (exposes: any) => (() => void) | undefined
  ): (() => void) | void {
    let registered = this.hasPlugin(pluginName);
    let whenUnregistered: (() => void) | undefined;
    if (registered) {
      whenUnregistered = callback(this.getPluginExposes(pluginName as any));
    }

    this.on("plugin:register", ({ pluginName: name }) => {
      if (pluginName == name) {
        if (registered) {
          whenUnregistered?.();
        }
        whenUnregistered = callback(this.getPluginExposes(pluginName as any));
        registered = true;
      }
    });

    this.on("plugin:unregister", ({ pluginName: name }) => {
      if (pluginName == name) {
        whenUnregistered?.();
        whenUnregistered = undefined;
        registered = false;
      }
    });
  }

  hasPlugin(pluginName: string): boolean {
    return this.#app.hasPlugin(pluginName);
  }

  registerValue<K extends keyof AppValueMap>(
    name: K,
    options: ValueOptions<AppValueMap[K]>
  ): void {
    try {
      this.#app.registerValue(name, options);
      this.#registered.values.add(name);
    } catch (err: any) {
      this.throw(err);
    }
  }

  unregisterValue(name: string): void {
    try {
      this.#app.unregisterValue(name);
      this.#registered.values.delete(name);
    } catch (err: any) {
      this.throw(err);
    }
  }

  registerCommand<T extends keyof AppCommandMap>(
    name: T,
    func: CommandFunction<AppCommandMap[T]>,
    options?: CommandOptions
  ): void {
    try {
      this.#app.registerCommand(name, func, options);
      this.#registered.commands.add(name);
    } catch (err: any) {
      this.throw(err);
    }
  }

  unregisterCommand(name: string): void {
    try {
      this.#app.unregisterCommand(name);
      this.#registered.commands.delete(name);
    } catch (err: any) {
      this.throw(err);
    }
  }

  on<K extends keyof AppEventDetailMap>(
    type: K,
    listener: AppEventListener<AppEventDetailMap[K]>
  ) {
    try {
      this.#app.on(type, listener);
      this.#registered.events.addItem(type, listener);
    } catch (err: any) {
      this.throw(err);
    }
  }

  once<K extends keyof AppEventDetailMap>(
    type: K,
    listener: AppEventListener<AppEventDetailMap[K]>
  ) {
    try {
      this.#app.once(type, listener);
      this.#registered.events.addItem(type, listener);
    } catch (err: any) {
      this.throw(err);
    }
  }

  off<K extends keyof AppEventDetailMap>(
    type: K,
    listener: AppEventListener<AppEventDetailMap[K]>
  ) {
    try {
      this.#app.off(type, listener);
      this.#registered.events.deleteItem(type, listener);
    } catch (err: any) {
      this.throw(err);
    }
  }

  emit<K extends keyof AppEventDetailMap>(
    type: K,
    detail: AppEventDetailMap[K],
    options?: AppEventEmitOptions & EventInit
  ) {
    try {
      this.#app.emit(type, detail || {}, {
        source: `plugin:${this.pluginName}`,
        ...options,
      });
    } catch (err: any) {
      this.throw(err);
    }
  }

  call<T extends keyof AppCommandMap>(
    name: T,
    ...args: Parameters<AppCommandMap[T]>
  ): ReturnType<AppCommandMap[T]> {
    try {
      return this.#app.callWithOptions(
        name,
        { source: `plugin:${this.pluginName}` },
        ...args
      );
    } catch (err: any) {
      this.throw(err);
      throw "";
    }
  }

  callWithOptions<T extends keyof AppCommandMap>(
    name: T,
    options: CommandCallOptions,
    ...args: Parameters<AppCommandMap[T]>
  ): ReturnType<AppCommandMap[T]> {
    try {
      return this.#app.callWithOptions(name, options, ...args);
    } catch (err: any) {
      this.throw(err);
      throw "";
    }
  }

  useHook<T extends keyof AppHookMap>(
    name: T,
    func: HookFunction<AppHookMap[T]>,
    options?: HookUseOptions
  ): void {
    try {
      this.#app.useHook(name, func, options);
      this.#registered.hooks.addItem(name, func);
    } catch (err: any) {
      this.throw(err);
    }
  }

  unuseHook<T extends keyof AppHookMap>(
    name: T,
    func: HookFunction<AppHookMap[T]>
  ): void {
    try {
      this.#app.unuseHook(name, func);
      this.#registered.hooks.deleteItem(name, func);
    } catch (err: any) {
      throw this.throw(err);
    }
  }

  callHook<T extends keyof AppHookMap>(
    name: T,
    ctx: AppHookMap[T],
    options?: HookCallOptions
  ): Promise<HookContext<AppHookMap[T]>> {
    try {
      return this.#app.callHook(name, ctx);
    } catch (err: any) {
      throw this.throw(err);
    }
  }

  callHookSync<T extends keyof AppHookMap>(
    name: T,
    ctx: AppHookMap[T],
    options?: HookCallOptions
  ): HookContext<AppHookMap[T]> {
    try {
      return this.#app.callHookSync(name, ctx);
    } catch (err: any) {
      throw this.throw(err);
    }
  }

  watch<K extends keyof AppValueMap>(
    name: K,
    watcher: (value: AppValueMap[K]) => void
  ): void {
    try {
      this.#app.watch(name, watcher);
    } catch (err: any) {
      this.throw(err);
    }
  }
  unwatch<K extends keyof AppValueMap>(
    name: K,
    watcher: (value: AppValueMap[K]) => void
  ): void {
    try {
      this.#app.unwatch(name, watcher);
    } catch (err: any) {
      this.throw(err);
    }
  }

  getValue<K extends keyof AppValueMap>(name: K) {
    try {
      return this.#app.getValue(name);
    } catch (err: any) {
      this.throw(err);
    }
  }

  setValue<K extends keyof AppValueMap>(name: K, value: AppValueMap[K]): void {
    try {
      this.#app.setValue(name, value);
    } catch (err: any) {
      this.throw(err);
    }
  }

  destroy() {
    const { plugins, events, values, hooks, commands } = this.#registered;
    plugins.forEach((pluginName) => this.#app.unregister(pluginName));
    events.forEach((listenerList, eventName) =>
      listenerList.forEach((listener) =>
        this.#app.off(eventName as any, listener)
      )
    );
    hooks.forEach((hookList, name) =>
      hookList.forEach((hookFunc) => this.#app.off(name as any, hookFunc))
    );
    commands.forEach((name) => this.#app.unregisterCommand(name));
    values.forEach((name) => this.#app.unregisterValue(name));
  }
}
