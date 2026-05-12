import type { PluginItem, PluginContext } from "./types";

export type * from "./types";

export class BasePlugin implements PluginItem {
  static pluginName: string;
  static role?: string;
  get pluginName() {
    return (this.constructor as typeof BasePlugin).pluginName;
  }
  get role() {
    return (this.constructor as typeof BasePlugin).role;
  }
  ctx: PluginContext;
  constructor(ctx: PluginContext, options?: any) {
    this.ctx = ctx;
  }
}
