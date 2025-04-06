import { AppError } from "../error";
import type { PluginItem, PluginContext } from "./types";

export type * from "./types";

export class BasePlugin implements PluginItem {
  static pluginName: string;
  pluginName!: string;
  ctx: PluginContext;
  readonly Error = AppError;
  readonly throw: (err?: Error) => void;
  constructor(ctx: PluginContext, options?: any) {
    this.ctx = ctx;
    this.throw = ctx.throw;
  }
}
