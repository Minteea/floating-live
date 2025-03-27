export type HookFunction<T> = (
  ctx: T
) => boolean | void | Promise<boolean | void>;

export interface HookItem<T> {
  call: HookFunction<T>;
  pluginName?: string;
}

export interface HookUseOptions {
  pluginName?: string;
}
export interface HookCallOptions {
  pluginName?: string;
}

export interface BaseHookContext {
  pluginName?: string;
  defaultPrevented?: boolean;
}

export type HookContext<T> = BaseHookContext & T;

export interface AppHookMap {
  "plugin.register": { pluginName: string; options: Record<string, any> };
}
