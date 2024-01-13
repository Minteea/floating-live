import { FloatingLive } from "../live";

interface ValueConfig<T> {
  get: () => T;
  set?: (value: T) => void;
}

export class ModValues {
  private list = new Map<string, ValueConfig<any>>();
  protected readonly main: FloatingLive;

  constructor(main: FloatingLive) {
    this.main = main;
  }
  /** 注册值 */
  register<T>(name: string, config: ValueConfig<T>) {
    this.list.set(name, config);
  }
  /** 取消注册 */
  unregister(name: string): void {
    this.list.delete(name);
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
  getMap() {
    const map: Record<string, any> = {};
    this.list.forEach((config, name) => {
      map[name] = config.get();
    });
    return map;
  }
}
