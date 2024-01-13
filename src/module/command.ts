import { FloatingLive } from "../live";

type CommandFunction = (...args: any[]) => any;

export default class ModCommand {
  /** 功能列表 */
  private readonly list = new Map<string, CommandFunction>();
  protected readonly main: FloatingLive;

  constructor(main: FloatingLive) {
    this.main = main;
  }

  /** 注册命令 */
  register(name: string, func: CommandFunction): void {
    this.list.set(name, func);
    this.main.emit("command:add", name);
  }

  /** 取消注册命令 */
  unregister(name: string): void {
    this.list.delete(name);
    this.main.emit("command:remove", name);
  }

  /** 调用命令 */
  call(name: string, ...args: any[]) {
    return this.list.get(name)?.(...args);
  }
}
