import { AppValueMap } from "../value";

export interface CommandOptions {
  pluginName?: string;
}

export interface CommandCallOptions {
  /** 命令来源 */
  source?: string;
  /** 命令发起客户端 */
  client?: any;
}

export interface CommandContext {
  /** 命令来源 */
  source?: string;
  /** 命令发起客户端 */
  client?: any;
}

export type CommandFunction<T extends (...args: any) => any> = (
  e: CommandContext,
  ...args: Parameters<T>
) => ReturnType<T>;

export interface CommandItem {
  call: CommandFunction<any>;
  pluginName?: string;
}

export interface CommandAliasItem {
  call?: undefined;
  targetName: string;
  pluginName?: string;
}

/** 命令函数类型表 */
export interface AppCommandMap {
  get: <T extends keyof AppValueMap>(name: T) => AppValueMap[T];
  set: <T extends keyof AppValueMap>(name: T, value: AppValueMap[T]) => boolean;

  /** 获取注册值数据 */
  "value.getData": () => {
    name: string;
    value: any;
  }[];

  /** 获取命令数据 */
  "command.getData": () => {
    name: string;
  }[];

  /** 获取插件数据 */
  "plugin.getData": () => {
    pluginName: string;
  }[];

  /** 获取hook数据 */
  "hook.getData": () => {
    name: string;
    list: { pluginName?: string }[];
  }[];
}

/** 命令别名映射 */
export interface AppCommandAliasMap {}
