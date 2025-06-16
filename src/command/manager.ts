import { App } from "../app";
import { AppError } from "../error";
import {
  CommandItem,
  CommandFunction,
  CommandCallOptions,
  CommandOptions,
} from "./types";

export class CommandManager {
  /** 功能列表 */
  private readonly list = new Map<string, CommandItem>();
  protected readonly app: App;

  constructor(app: App) {
    this.app = app;
    app.registerCommand("command.snapshot", () => this.toSnapshot());
  }

  /** 注册命令 */
  register(
    name: string,
    call: CommandFunction<any>,
    options?: CommandOptions
  ): void {
    const { pluginName } = options || {};
    this.list.set(name, { call, pluginName });
    this.app.emit("command:register", { name });
  }

  /** 取消注册命令 */
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
      throw new AppError("command:call_unexist", {
        message: `命令不存在: ${name}`,
        target: `command/${name}`,
      });
    } else {
      return command.call(
        { source: options.source, client: options.client },
        ...args
      );
    }
  }

  /** 检测命令是否存在 */
  has(name: string) {
    return this.list.has(name);
  }

  /** 获取数据 */
  toSnapshot() {
    return [...this.list].map(([name, { pluginName }]) => ({
      name,
      pluginName,
    }));
  }
}
