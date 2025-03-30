import {
  CommandOptions,
  CommandCallOptions,
  AppCommandMap,
  CommandFunction,
} from "../command";
import { AppError, ErrorOptions } from "../error";
import {
  AppEventListener,
  AppEventEmitOptions,
  AppEventDetailMap,
} from "../event";
import {
  AppHookMap,
  HookCallOptions,
  HookContext,
  HookFunction,
  HookUseOptions,
} from "../hook";
import { AppValueMap, ValueOptions } from "../value";

/** 插件对象 */
export interface PluginItem {
  pluginName: string;
  register?(
    ctx: PluginContext,
    options?: Record<string, any>
  ): void | Promise<void>;
  destroy?(ctx: PluginContext): void | Promise<void>;
  expose?(ctx: PluginContext): any;
}

/** 插件构造器 */
export interface PluginConstructor {
  pluginName: string;
  new (ctx: PluginContext, options: any): PluginItem;
}

/** 插件注册选项 */
export interface PluginRegisterOptions {}

/** 插件上下文 */
export interface PluginContext {
  //--- 事件机制 ---//
  /** 监听事件 */
  on<K extends keyof AppEventDetailMap>(
    type: K,
    listener: AppEventListener<AppEventDetailMap[K]>
  ): void;

  /** 单次监听事件 */
  once<K extends keyof AppEventDetailMap>(
    type: K,
    listener: AppEventListener<AppEventDetailMap[K]>
  ): void;

  /** 取消监听事件 */
  off<K extends keyof AppEventDetailMap>(
    type: K,
    listener: AppEventListener<AppEventDetailMap[K]>
  ): void;

  /** 发送事件 */
  emit<K extends keyof AppEventDetailMap>(
    type: K,
    detail: AppEventDetailMap[K],
    options?: AppEventEmitOptions & EventInit
  ): void;

  /** 抛出错误 */
  throw(err?: Error): void;

  /** 生成错误 */
  error(id: string, options: ErrorOptions): AppError;

  //--- 插件机制 ---//
  /** 注册插件 */
  register(plugin: PluginConstructor, options?: PluginRegisterOptions): void;

  /** 取消注册插件 */
  unregister(pluginName: string): void;

  /** 获取插件暴露对象 */
  getPluginExposes<K extends keyof AppPluginExposesMap>(
    pluginName: K
  ): AppPluginExposesMap[K];

  /** 等待plugin注册 */
  whenRegister(
    pluginName: string,
    callback: (exposes: any) => (() => void) | void
  ): void;

  /** 是否存在插件 */
  hasPlugin(pluginName: string): boolean;

  //--- 指令机制 ---//
  /** 注册指令 */
  registerCommand<T extends keyof AppCommandMap>(
    name: T,
    func: CommandFunction<AppCommandMap[T]>,
    options?: CommandOptions
  ): void;

  /** 取消注册指令 */
  unregisterCommand(name: string): void;

  /** 调用指令 */
  call<T extends keyof AppCommandMap>(
    name: T,
    ...args: Parameters<AppCommandMap[T]>
  ): ReturnType<AppCommandMap[T]>;

  /** 调用指令(可配置) */
  callWithOptions<T extends keyof AppCommandMap>(
    name: T,
    options: CommandCallOptions,
    ...args: Parameters<AppCommandMap[T]>
  ): ReturnType<AppCommandMap[T]>;

  //--- 钩子机制 ---//
  /** 挂载钩子 */
  useHook<T extends keyof AppHookMap>(
    name: T,
    func: HookFunction<AppHookMap[T]>,
    options?: HookUseOptions
  ): void;

  /** 取消挂载钩子 */
  unuseHook<T extends keyof AppHookMap>(
    name: T,
    func: HookFunction<AppHookMap[T]>
  ): void;

  /** 调用钩子 */
  callHook<T extends keyof AppHookMap>(
    name: T,
    ctx: AppHookMap[T],
    options?: HookCallOptions
  ): Promise<HookContext<AppHookMap[T]>>;

  /** 调用同步钩子 */
  callHookSync<T extends keyof AppHookMap>(
    name: T,
    ctx: AppHookMap[T],
    options?: HookCallOptions
  ): HookContext<AppHookMap[T]>;

  //--- 值机制 ---//
  /** 注册值 */
  registerValue<K extends keyof AppValueMap>(
    name: K,
    options: ValueOptions<AppValueMap[K]>
  ): void;

  /** 取消注册值 */
  unregisterValue(name: string): void;

  /** 监听值 */
  watch<K extends keyof AppValueMap>(
    name: K,
    watcher: (value: AppValueMap[K]) => void
  ): void;

  /** 取消监听值 */
  unwatch<K extends keyof AppValueMap>(
    name: K,
    watcher: (value: AppValueMap[K]) => void
  ): void;

  /** 获取值 */
  getValue<K extends keyof AppValueMap>(name: K): AppValueMap[K];

  /** 设置值 */
  setValue<K extends keyof AppValueMap>(name: K, value: AppValueMap[K]): void;

  destroy(): void;
}

export interface AppPluginExposesMap {
  "": {};
}
