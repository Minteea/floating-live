import { FloatingLive } from "../live";
import { FloatingValueMap } from "../types/value";

interface ValueConfig<T> {
  get: () => T;
  set?: (value: T) => void;
}

export class ModValue {
  private list = new Map<string, ValueConfig<any>>();
  protected readonly main: FloatingLive;

  constructor(main: FloatingLive) {
    this.main = main;
  }
  /** 注册值 */
  register<T>(name: string, config: ValueConfig<T>) {
    this.list.set(name, config);
    this.main.emit("value:add", name);
  }
  /** 取消注册 */
  unregister(name: string): void {
    this.list.delete(name);
    this.main.emit("value:remove", name);
  }
  /** 获取值 */
  get(name: string) {
    return this.list.get(name)?.get();
  }
  /** 设置值 */
  set(name: string, value: any) {
    const valueConfig = this.list.get(name);
    if (valueConfig?.set) {
      valueConfig?.set(value);
      return true;
    } else {
      return false;
    }
  }
  /** 获取注册的所有值 */
  getSnapshot() {
    const map: Record<string, any> = {};
    this.list.forEach((config, name) => {
      map[name] = config.get();
    });
    return map;
  }

  emit<T extends keyof FloatingValueMap>(name: T, value: FloatingValueMap[T]) {
    this.main.emit(`change:${name as string}`, value);
    this.main.emit("value:change", name, value);
  }
  watch<T extends keyof FloatingValueMap>(
    name: T,
    listener: (value: FloatingValueMap[T]) => void
  ) {
    this.main.on(`change:${name}`, listener);
  }
  unwatch<T extends keyof FloatingValueMap>(
    name: T,
    listener: (value: FloatingValueMap[T]) => void
  ) {
    this.main.off(`change:${name}`, listener);
  }
}
