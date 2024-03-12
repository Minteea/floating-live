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
    const { command } = main;
    command.register("get", this.get.bind(this));
    command.register("set", this.set.bind(this));
  }
  /** 注册值 */
  register<T extends keyof FloatingValueMap>(
    name: T,
    config: ValueConfig<FloatingValueMap[T]>
  ) {
    this.list.set(name, config);
    this.main.emit("value:add", name);
    this.main.emit("value:change", name, config.get());
  }
  /** 取消注册 */
  unregister(name: string): void {
    this.list.delete(name);
    this.main.emit("value:remove", name);
    this.main.emit("value:change", name, undefined);
  }
  /** 获取值 */
  get<T extends keyof FloatingValueMap>(name: T) {
    return this.list.get(name)?.get();
  }
  /** 设置值 */
  set<T extends keyof FloatingValueMap>(name: T, value: FloatingValueMap[T]) {
    const valueConfig = this.list.get(name);
    if (valueConfig?.set) {
      valueConfig?.set(value);
      return true;
    } else {
      return false;
    }
  }
  has(name: string) {
    return this.list.has(name);
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

  /** 获取注册的所有值 */
  getSnapshot() {
    const map: Record<string, any> = {};
    this.list.forEach((config, name) => {
      map[name] = config.get();
    });
    return map;
  }
}
