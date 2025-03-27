export interface ValueOptions<T> {
  pluginName?: string;
  get: () => T;
  set?: (value: T) => void;
}
export interface ValueContext<T> {
  emit: (value: T) => void;
}
export interface ValueItem<T> {
  pluginName?: string;
  get: (options?: ValueAccessOptions) => T;
  set?: (value: T, options?: ValueAccessOptions) => void;
}

export interface ValueAccessOptions {
  pluginName?: string;
}

export interface AppValueMap {
  "": undefined;
}
