import { App } from "../app";
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
import { LiveRoomData } from "../live";
import { AppValueMap, ValueContext, ValueOptions } from "../value";
import { WhenRegisterCallback } from "./manager";

/** 插件对象 */
export interface PluginItem {
  /** 插件名称 */
  pluginName: string;
  /** 插件作用 */
  role?: string;
  /** 初始化插件 */
  init?(
    ctx: PluginContext,
    options?: Record<string, any>,
  ): void | Promise<void>;
  /** 插件销毁 */
  destroy?(ctx: PluginContext): void | Promise<void>;
  /** 插件暴露 */
  expose?(ctx: PluginContext): any;
}

/** 插件构造器 */
export interface PluginConstructor<P extends PluginItem> {
  pluginName: string;
  new(ctx: PluginContext, options: any): P;
}

/** 插件初始化选项 */
export interface PluginInitOptions { }

/** 插件注册选项 */
export interface PluginRegisterOptions {
  /** 提供的插件上下文 */
  context?: PluginContext;
  /** 核心插件，不可解除注册 @deprecated */
  core?: boolean;
  /** 不可注销 */
  unremovable?: boolean;
  /** 可访问App实例 */
  accessApp?: boolean;
  /** 插件类型 */
  pluginType?: "core" | "framework" | "";
}

/** 插件上下文 */
export interface PluginContext {
  /** 安全插件上下文 */
  safe?: boolean;
  /** 获取App实例，仅在核心插件上下文提供 */
  getApp(): App | null;

  //--- 事件机制 ---//
  /** 监听事件 */
  on<K extends keyof AppEventDetailMap>(
    type: K,
    listener: AppEventListener<AppEventDetailMap[K]>,
  ): void;

  /** 单次监听事件 */
  once<K extends keyof AppEventDetailMap>(
    type: K,
    listener: AppEventListener<AppEventDetailMap[K]>,
  ): void;

  /** 取消监听事件 */
  off<K extends keyof AppEventDetailMap>(
    type: K,
    listener: AppEventListener<AppEventDetailMap[K]>,
  ): void;

  /** 发送事件 */
  emit<K extends keyof AppEventDetailMap>(
    type: K,
    detail: AppEventDetailMap[K],
    options?: AppEventEmitOptions & EventInit,
  ): void;

  /** 抛出错误 */
  throw(err?: Error): void;

  /** 生成错误 @deprecated */
  error(id: string, options: ErrorOptions): AppError;

  //--- 插件机制 ---//
  /** 注册插件 */
  register<P extends PluginItem>(
    plugin: PluginConstructor<P>,
    options?: PluginInitOptions,
  ): Promise<P>;

  /** 注销插件 */
  unregister(pluginName: string): void;

  /** 获取插件暴露对象 */
  getPluginExposes<K extends keyof AppPluginExposesMap>(
    pluginName: K,
  ): AppPluginExposesMap[K];

  /** 等待plugin注册 */

  whenRegister(pluginName: string, callback: WhenRegisterCallback): void;

  cancelWhenRegister(pluginName: string, callback: WhenRegisterCallback): void;

  /** 是否存在插件 */
  hasPlugin(pluginName: string): boolean;

  //--- 指令机制 ---//
  /** 注册指令 */
  registerCommand<T extends keyof AppCommandMap>(
    name: T,
    func: CommandFunction<AppCommandMap[T]>,
    options?: CommandOptions,
  ): void;

  /** 注销指令 */
  unregisterCommand(name: string): void;

  /** 检测值是否存在 */
  hasCommand(name: string): boolean;

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
    options?: HookUseOptions,
  ): void;

  /** 取消挂载钩子 */
  unuseHook<T extends keyof AppHookMap>(
    name: T,
    func: HookFunction<AppHookMap[T]>,
  ): void;

  /** 调用钩子 */
  callHook<T extends keyof AppHookMap>(
    name: T,
    ctx: AppHookMap[T],
    options?: HookCallOptions,
  ): Promise<HookContext<AppHookMap[T]>>;

  /** 调用同步钩子 */
  callHookSync<T extends keyof AppHookMap>(
    name: T,
    ctx: AppHookMap[T],
    options?: HookCallOptions,
  ): HookContext<AppHookMap[T]>;

  //--- 值机制 ---//
  /** 注册值 */
  registerValue<K extends keyof AppValueMap>(
    name: K,
    options: ValueOptions<AppValueMap[K]>,
  ): ValueContext<AppValueMap[K]>;

  /** 注销值 */
  unregisterValue(name: string): void;

  /** 监听值 */
  watch<K extends keyof AppValueMap>(
    name: K,
    watcher: (value: AppValueMap[K]) => void,
  ): void;

  /** 取消监听值 */
  unwatch<K extends keyof AppValueMap>(
    name: K,
    watcher: (value: AppValueMap[K]) => void,
  ): void;

  /** 值是否存在 */
  hasValue(name: string): boolean;

  /** 获取值 */
  getValue<K extends keyof AppValueMap>(name: K): AppValueMap[K];

  /** 设置值 */
  setValue<K extends keyof AppValueMap>(name: K, value: AppValueMap[K]): void;

  destroy(): void;

  get signal(): AbortSignal;
}

export interface AppPluginExposesMap {
  "": {};
}

export interface AppSnapshotMap {
  plugin: { pluginName: string }[];
  value: { name: string; value: any }[];
  command: { name: string }[];
  hook: { name: string; list: { pluginName?: string }[] }[];
}
