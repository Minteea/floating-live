import { AppErrorLegacy } from "../error";
import type { PluginItem, PluginContext } from "./types";

export type * from "./types";

export class BasePlugin implements PluginItem {
  static pluginName: string;
  get pluginName() {
    return (this.constructor as typeof BasePlugin).pluginName;
  }
  ctx: PluginContext;
  constructor(ctx: PluginContext, options?: any) {
    this.ctx = ctx;
  }
}
