import {
  CommandOptions,
  CommandCallOptions,
  AppCommandMap,
  CommandFunction,
} from "./command";
import { CommandManager } from "./command/manager";
import { AppError } from "./error";
import {
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
  PluginConstructor,
  PluginContext,
  PluginInitOptions,
  PluginItem,
} from "./plugin";
import { PluginManager } from "./plugin/manager";
import { bindCommand } from "./utils";
import { CustomEventEmitter } from "./utils/EventEmitter";
import { AppValueMap, ValueOptions } from "./value";
import { ValueManager } from "./value/manager";

export class App extends CustomEventEmitter implements PluginContext {
  protected hookManager: HookManager;
  protected pluginManager: PluginManager;
  protected commandManager: CommandManager;
  protected valueManager: ValueManager;
  protected abortController = new AbortController();
  constructor() {
    super();
    this.commandManager = new CommandManager(this);
    this.hookManager = new HookManager(this);
    this.valueManager = new ValueManager(this);
    this.pluginManager = new PluginManager(this);

    // 初始化命令
    this.registerCommand("command.snapshot", () =>
      this.commandManager.toSnapshot()
    );
    this.registerCommand("get", (e, name) => this.getValue(name));
    this.registerCommand("set", (e, name, value) => this.setValue(name, value));
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
    super.emit("event", { name: type, detail: { ...detail, source, remote } });
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
  register<P extends PluginItem>(
    plugin: PluginConstructor<P>,
    options?: PluginInitOptions
  ): Promise<P> {
    return this.pluginManager.register(plugin, options);
  }

  /** 同步注册插件 */
  registerSync<P extends PluginItem>(
    plugin: PluginConstructor<P>,
    options?: PluginInitOptions
  ): P {
    return this.pluginManager.registerSync(plugin, options);
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
    return this.pluginManager.getExposes(pluginName);
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

  hasCommand(name: string): boolean {
    return this.commandManager.has(name);
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
    return this.valueManager.register(name, options);
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

  hasValue(name: string): boolean {
    return this.valueManager.has(name);
  }

  getValue<K extends keyof AppValueMap>(name: K): AppValueMap[K] {
    return this.valueManager.get(name);
  }

  setValue(name: string, value: any) {
    return this.valueManager.set(name, value);
  }

  destroy(): void {
    this.abortController.abort();
  }

  //--- 其他 ---//
  /** 拓展值 */
  define(key: string, value: ((...args: any[]) => any) | PropertyDescriptor) {
    if (typeof value == "function") {
      Object.defineProperty(this, key, { value });
    } else {
      Object.defineProperty(this, key, value);
    }
  }

  get signal() {
    return this.abortController.signal;
  }
}
