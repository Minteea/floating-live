import type { PluginItem, PluginContext } from "./types";

export type * from "./types";

export class BasePlugin implements PluginItem {
  static pluginName: string;
  pluginName!: string;
  ctx: PluginContext;
  constructor(ctx: PluginContext, options?: any) {
    this.ctx = ctx;
  }
}
