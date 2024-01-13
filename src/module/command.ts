import { FloatingLive } from "../live";
import { FloatingCommandMap } from "../types";

type CommandFunction = (...args: any[]) => any;

export default class ModCommand {
  /** 功能列表 */
  private readonly list = new Map<string, CommandFunction>();
  protected readonly main: FloatingLive;

  constructor(main: FloatingLive) {
    this.main = main;
  }

  /** 注册命令 */
  register<T extends keyof FloatingCommandMap>(
    name: T,
    func: FloatingCommandMap[T]
  ): void {
    this.list.set(name, func);
    this.main.emit("command:add", name);
  }

  /** 取消注册命令 */
  unregister(name: string): void {
    this.list.delete(name);
    this.main.emit("command:remove", name);
  }

  /** 调用命令 */
  call<T extends keyof FloatingCommandMap>(
    name: T,
    ...args: Parameters<FloatingCommandMap[T]>
  ) {
    return this.list.get(name)?.(...args);
  }

  /** 获取快照 */
  snapshot() {
    return [...this.list].map(([key]) => key);
  }
}
