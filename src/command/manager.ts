import { appError } from "~/error";
import { App } from "../app";
import {
  CommandItem,
  CommandFunction,
  CommandCallOptions,
  CommandOptions,
  CommandAliasItem,
} from "./types";

export class CommandManager {
  /** 功能列表 */
  private readonly list = new Map<string, CommandItem | CommandAliasItem>();
  protected readonly app: App;

  constructor(app: App) {
    this.app = app;
  }

  /** 注册命令 */
  register(
    name: string,
    call: CommandFunction<any>,
    options?: CommandOptions,
  ): void {
    const { pluginName } = options || {};
    this.list.set(name, { call, pluginName });
    this.app.emit("command:register", { name });
  }

  /** 注册命令别名 */
  registerAlias(
    name: string,
    targetName: string,
    options?: CommandOptions,
  ): void {
    const { pluginName } = options || {};
    this.list.set(name, { targetName, pluginName });
    this.app.emit("command:register", { name });
  }

  /** 注销命令 */
  unregister(name: string): void {
    this.list.delete(name);
    this.app.emit("command:unregister", { name });
  }

  /** 调用命令 */
  call(name: string, ...args: any[]) {
    return this.callWithOptions(name, {}, ...args);
  }

  /** 调用命令(可配置) */
  callWithOptions(name: string, options: CommandCallOptions, ...args: any[]) {
    const command = this.list.get(name);
    if (!command) {
      throw appError("command:call_unexist", {
        message: `命令不存在[${name}]`,
        target: `command/${name}`,
      });
    } else {
      const { call } = command;
      if (!call) {
        return this._callAliasWithOptions(
          name,
          (command as CommandAliasItem).targetName,
          options,
          ...args,
        );
      } else {
        return call(
          { source: options.source, client: options.client },
          ...args,
        );
      }
    }
  }

  /** 从命令别名调用命令 */
  private _callAliasWithOptions(
    name: string,
    targetName: string,
    options: CommandCallOptions,
    ...args: any[]
  ) {
    const tcommand = this.list.get(targetName);
    if (!tcommand) {
      throw appError("command:alias_unexist", {
        message: `命令别名[${name}]指向的命令不存在[${targetName}]`,
        target: `command/${name}>${targetName}`,
      });
    } else {
      const { call } = tcommand;
      if (!call) {
        throw appError("command:alias_target_uncallable", {
          message: `命令别名[${name}]不可指向其他命令别名[${targetName}]`,
          target: `command/${name}>${targetName}>${tcommand.targetName}`,
        });
      }
      return call({ source: options.source, client: options.client }, ...args);
    }
  }

  /** 检测命令是否存在 */
  has(name: string) {
    return this.list.has(name);
  }

  /** 获取数据 */
  getData() {
    return [...this.list].map(([name, { pluginName }]) => ({
      name,
      pluginName,
    }));
  }
}
