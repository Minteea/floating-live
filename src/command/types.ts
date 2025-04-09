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

  /** 获取注册值快照 */
  "value.snapshot": () => {
    name: string;
    value: string;
  }[];

  /** 获取命令快照 */
  "command.snapshot": () => {
    name: string;
  }[];

  /** 获取hook快照 */
  "hook.snapshot": () => {
    name: string;
    list: { pluginName?: string }[];
  }[];
}
