import { FloatingLive } from "../live";

export class ModStore {
  private list = new Map<string, Map<string, any>>();
  protected readonly main: FloatingLive;

  constructor(main: FloatingLive) {
    this.main = main;
  }
  /** 注册钩子函数 */
  register<T>(name: string, id: string, value: T) {
    let store = this.list.get(name);
    if (!store) {
      store = new Map();
      this.list.set(name, store);
    }
    store.set(id, value);
  }
  /** 取消注册钩子函数 */
  unregister(name: string, id: string): void {
    let store = this.list.get(name);
    if (store) {
      store.delete(id);
    }
  }
  /** 获取值 */
  get(name: string) {
    return this.list.get(name);
  }
  /** 获取注册的所有值 */
  getMap() {
    const map: Record<string, Record<string, any>> = {};
    this.list.forEach((store, name) => {
      const part: Record<string, any> = {};
      map[name] = part;
      store.forEach((value, id) => {
        part[id] = value;
      });
    });
    return map;
  }
}
