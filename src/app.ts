import {
  CommandOptions,
  CommandCallOptions,
  AppCommandMap,
  CommandFunction,
} from "./command";
import { CommandManager } from "./command/manager";
import { AppError } from "./error";
import {
  AppEventDetail,
  AppEventDetailMap,
  AppEventEmitOptions,
  AppEventListener,
} from "./event";
import {
  AppHookMap,
  HookCallOptions,
  HookContext,
  HookFunction,
  HookUseOptions,
} from "./hook";
import { HookManager } from "./hook/manager";
import {
  AppPluginExposesMap,
  PluginContext,
  PluginInitOptions,
} from "./plugin";
import { PluginManager } from "./plugin/manager";
import { CustomEventEmitter } from "./utils/EventEmitter";
import { AppValueMap, ValueOptions } from "./value";
import { ValueManager } from "./value/manager";

export class App extends CustomEventEmitter implements PluginContext {
  private hookManager: HookManager;
  private pluginManager: PluginManager;
  private commandManager: CommandManager;
  private valueManager: ValueManager;
  private abortController = new AbortController();
  constructor() {
    super();
    this.hookManager = new HookManager(this);
    this.pluginManager = new PluginManager(this);
    this.commandManager = new CommandManager(this);
    this.valueManager = new ValueManager(this);
  }
  //--- 事件机制 ---//
  on<K extends keyof AppEventDetailMap>(
    type: K,
    listener: AppEventListener<AppEventDetailMap[K]>,
    signal?: AbortSignal
  ): void;
  on<T>(
    type: string,
    listener: AppEventListener<T>,
    signal: AbortSignal = this.signal
  ) {
    super.on(type, listener, signal);
  }

  once<K extends keyof AppEventDetailMap>(
    type: K,
    listener: AppEventListener<AppEventDetailMap[K]>,
    signal?: AbortSignal
  ): void;
  once<T>(
    type: string,
    listener: AppEventListener<T>,
    signal: AbortSignal = this.signal
  ) {
    super.once(type, listener, signal);
  }

  off<K extends keyof AppEventDetailMap>(
    type: K,
    listener: AppEventListener<AppEventDetailMap[K]>
  ): void;
  off<T>(type: string, listener: AppEventListener<T>) {
    super.off(type, listener);
  }

  emit<K extends keyof AppEventDetailMap>(
    type: K,
    detail: AppEventDetailMap[K],
    options?: AppEventEmitOptions & EventInit
  ): void;
  emit<T>(type: string, detail: T, options?: AppEventEmitOptions & EventInit) {
    const { source, remote } = options || {};
    super.emit(type, { ...detail, source, remote }, options);
  }

  //--- 错误机制 ---//
  /** 发送错误 */
  throw(err?: Error) {
    throw err;
  }

  error(id: string, detail?: Record<string, any>) {
    return new AppError(id, detail || {});
  }

  //--- 插件机制 ---//
  /** 注册插件 */
  register(plugin: any, options?: PluginInitOptions) {
    this.pluginManager.register(plugin, options);
  }

  /** 取消注册插件 */
  unregister(pluginName: string) {
    this.pluginManager.unregister(pluginName);
  }

  getPlugin(pluginName: string) {
    this.pluginManager.getPlugin(pluginName);
  }

  whenRegister<K extends keyof AppPluginExposesMap>(
    pluginName: K,
    callback: (exposes: AppPluginExposesMap[K]) => (() => void) | void
  ): void;
  whenRegister(pluginName: string, callback: () => (() => void) | void): void;
  whenRegister(
    pluginName: string,
    callback: (exposes: any) => (() => void) | void
  ): void {
    let registered = this.hasPlugin(pluginName);
    let whenUnregistered: (() => void) | void;
    if (registered) {
      whenUnregistered = callback(this.getPluginExposes(pluginName));
    }

    this.on("plugin:register", ({ pluginName: name }: any) => {
      if (pluginName == name) {
        if (registered) {
          whenUnregistered?.();
        }
        whenUnregistered = callback(this.getPluginExposes(pluginName));
        registered = true;
      }
    });

    this.on("plugin:unregister", ({ pluginName: name }: any) => {
      if (pluginName == name) {
        whenUnregistered?.();
        whenUnregistered = undefined;
        registered = false;
      }
    });
  }

  getPluginExposes(pluginName: string): any {
    this.pluginManager.getExposes(pluginName);
  }

  hasPlugin(pluginName: string) {
    return this.pluginManager.has(pluginName);
  }

  //--- 指令机制 ---//
  registerCommand<T extends keyof AppCommandMap>(
    name: T,
    func: CommandFunction<AppCommandMap[T]>,
    options?: CommandOptions
  ) {
    this.commandManager.register(name, func, options);
  }

  unregisterCommand(name: string) {
    this.commandManager.unregister(name);
  }

  call<T extends keyof AppCommandMap>(
    name: T,
    ...args: Parameters<AppCommandMap[T]>
  ): ReturnType<AppCommandMap[T]> {
    return this.commandManager.call(name, ...args);
  }

  callWithOptions<T extends keyof AppCommandMap>(
    name: T,
    options: CommandCallOptions,
    ...args: Parameters<AppCommandMap[T]>
  ): ReturnType<AppCommandMap[T]> {
    return this.commandManager.callWithOptions(name, options, ...args);
  }

  //--- 钩子机制 ---//
  useHook<T extends keyof AppHookMap>(
    name: T,
    func: HookFunction<AppHookMap[T]>,
    options?: HookUseOptions
  ) {
    this.hookManager.use(name, func, options);
  }

  unuseHook<T extends keyof AppHookMap>(
    name: T,
    func: HookFunction<AppHookMap[T]>
  ) {
    this.hookManager.unuse(name, func);
  }

  callHook<T extends keyof AppHookMap>(
    name: T,
    ctx: AppHookMap[T],
    options?: HookCallOptions
  ): Promise<HookContext<AppHookMap[T]>> {
    return this.hookManager.call(name, ctx);
  }

  callHookSync<T extends keyof AppHookMap>(
    name: T,
    ctx: AppHookMap[T],
    options?: HookCallOptions
  ): HookContext<AppHookMap[T]> {
    return this.hookManager.callSync(name, ctx);
  }

  //--- 值机制 ---//
  registerValue<K extends keyof AppValueMap>(
    name: K,
    options: ValueOptions<AppValueMap[K]>
  ) {
    this.valueManager.register(name, options);
  }

  unregisterValue(name: string) {
    this.valueManager.unregister(name);
  }

  watch<K extends keyof AppValueMap>(
    name: K,
    watcher: (value: AppValueMap[K]) => void
  ) {
    this.valueManager.watch(name, watcher);
  }

  unwatch<K extends keyof AppValueMap>(
    name: K,
    watcher: (value: AppValueMap[K]) => void
  ) {
    this.valueManager.unwatch(name, watcher);
  }

  getValue<K extends keyof AppValueMap>(name: K): AppValueMap[K] {
    return this.valueManager.get(name);
  }

  setValue(name: string, value: any) {
    this.valueManager.set(name, value);
  }

  destroy(): void {
    this.abortController.abort();
  }

  //--- 其他 ---//
  /** 拓展值 */
  define() {}

  get signal() {
    return this.abortController.signal;
  }
}
