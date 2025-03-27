import { App } from "../app";
import { bindCommand } from "../utils";
import { ValueAccessOptions, ValueItem, ValueOptions } from "./types";

export class ValueManager {
  private list = new Map<string, ValueItem<any>>();
  protected readonly app: App;

  constructor(app: App) {
    this.app = app;
    app.registerCommand("get", bindCommand(this.get, this));
    app.registerCommand("set", bindCommand(this.set, this));
  }
  /** 注册值 */
  register<T>(name: string, { get, set, pluginName }: ValueOptions<T>) {
    this.list.set(name, { get, set, pluginName });
    this.app.emit(
      "value:register",
      { name, value: get() },
      { source: `plugin:${pluginName}` }
    );
  }
  /** 取消注册 */
  unregister(name: string): void {
    this.list.delete(name);
    this.app.emit("value:unregister", { name });
  }
  /** 获取值 */
  get(name: string, options?: ValueAccessOptions) {
    const item = this.list.get(name);
    if (!item) throw {};
    return item.get(options);
  }
  /** 获取值(不存在则返回undefined) */
  getNullable(name: string, options?: ValueAccessOptions) {
    return this.list.get(name)?.get(options);
  }
  /** 设置值 */
  set(name: string, value: any, options?: ValueAccessOptions) {
    const valueItem = this.list.get(name);
    if (valueItem?.set) {
      valueItem?.set(value, options);
      return true;
    } else {
      return false;
    }
  }
  /** 检测值是否存在 */
  has(name: string) {
    return this.list.has(name);
  }

  emit(name: string, value: any) {
    this.app.emit(`change:${name as string}`, value);
    this.app.emit("value:change", { name, value });
  }
  watch(name: string, listener: (value: any) => void) {
    this.app.on(`change:${name}`, listener);
  }
  unwatch(name: string, listener: (value: any) => void) {
    this.app.off(`change:${name}`, listener);
  }

  /** 获取注册的所有值 */
  getData() {
    const map: Record<string, any> = {};
    this.list.forEach((config, name) => {
      map[name] = config.get();
    });
    return map;
  }
}
