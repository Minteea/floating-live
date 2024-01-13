import { FloatingLive } from "../live";

export type HookFunction<T> = (
  ctx: T
) => boolean | void | Promise<boolean | void>;

export class ModHook {
  private list = new Map<string, HookFunction<any>[]>();
  protected readonly main: FloatingLive;

  constructor(main: FloatingLive) {
    this.main = main;
  }
  /** 注册钩子函数 */
  register<T>(name: string, func: HookFunction<T>) {
    let hooks = this.list.get(name);
    if (!hooks) {
      hooks = [];
      this.list.set(name, hooks);
    }
    hooks.push(func);
  }
  /** 取消注册钩子函数 */
  unregister(name: string, func: HookFunction<any>): void {
    let hooks = this.list.get(name);
    if (hooks) {
      const index = hooks.indexOf(func);
      index > -1 && hooks.splice(index, 1);
    }
  }
  /** 调用钩子函数 */
  async call<T>(name: string, ctx: T) {
    const hooks = this.list.get(name);
    if (!hooks) {
      return true;
    }
    for (const func of hooks) {
      const result = await func(ctx);
      if (result == true) {
        return true;
      } else if (result == false) {
        return false;
      }
    }
    return false;
  }
}
