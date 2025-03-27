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

export interface AppCommandMap {
  get: <T extends keyof AppValueMap>(name: T) => AppValueMap[T];
  set: <T extends keyof AppValueMap>(name: T, value: AppValueMap[T]) => boolean;
}
