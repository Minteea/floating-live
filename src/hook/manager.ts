import { App } from "../app";
import { AppError, ErrorOptions } from "../error";
import { HookFunction, HookItem, HookUseOptions } from "./types";

export interface HookErrorOptions extends ErrorOptions {
  hookName: string;
}

export class HookError extends AppError {
  hookName: string;
  constructor(id: string, options: HookErrorOptions) {
    super(id, options);
    this.hookName = options.hookName;
  }
}

export class HookManager {
  private list = new Map<string, HookItem<any>[]>();
  private pluginMap = new Map<string, string>();
  protected readonly app: App;

  constructor(app: App) {
    this.app = app;
  }
  /** 挂载钩子函数 */
  use(name: string, call: HookFunction<any>, options?: HookUseOptions) {
    const { pluginName } = options || {};
    let hooks = this.list.get(name);
    if (!hooks) {
      hooks = [];
      this.list.set(name, hooks);
    } else if (hooks.includes(call)) {
      throw new HookError("hook:use_duplicate", {
        message: `钩子函数挂载失败: ${name}`,
        cause: "重复挂载同一函数",
        hookName: name,
      });
    }
    hooks.push({ call, pluginName });
  }
  /** 取消挂载钩子函数 */
  unuse(name: string, call: HookFunction<any>): void {
    let hooks = this.list.get(name);
    if (!hooks)
      throw new HookError("hook:unuse_unexisted", {
        message: `钩子函数卸载失败: ${name}`,
        cause: "卸载不存在的钩子函数",
        hookName: name,
      });
    const index = hooks.findIndex((item) => item.call == call);
    if (index < 0) throw {};
    hooks.splice(index, 1);
  }
  /** 调用钩子函数 */
  async call(name: string, ctx: any) {
    const hooks = this.list.get(name);
    if (!hooks) {
      return ctx;
    }
    for (const item of hooks) {
      const skip = await item.call(ctx);
      if (skip) {
        return ctx;
      }
    }
    return ctx;
  }
  /** 同步调用钩子函数 */
  callSync(name: string, ctx: any) {
    const hooks = this.list.get(name);
    if (!hooks) {
      return ctx;
    }
    for (const item of hooks) {
      const skip = item.call(ctx);
      if (skip) {
        return ctx;
      }
    }
    return ctx;
  }
  getData() {
    const map: Record<string, number> = {};
    return [...this.list].map(([name, fnList]) => {
      map[name] = fnList.length;
    });
  }
}
