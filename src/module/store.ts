import { FloatingLive } from "../live";
import { FloatingStoreMap } from "../types/store";

export class ModStore {
  private list = new Map<string, Map<string, any>>();
  protected readonly main: FloatingLive;

  constructor(main: FloatingLive) {
    this.main = main;
  }
  /** 注册store */
  register<T extends keyof FloatingStoreMap>(
    name: T,
    id: string,
    value: FloatingStoreMap[T]
  ) {
    let store = this.list.get(name);
    if (!store) {
      store = new Map();
      this.list.set(name, store);
    }
    store.set(id, value);
    this.main.emit("store:add", name, id, value);
  }
  /** 取消注册store */
  unregister<T extends keyof FloatingStoreMap>(name: T, id: string): void {
    let store = this.list.get(name);
    if (store) {
      store.delete(id);
      this.main.emit("store:remove", name, id);
    }
  }
  /** 获取值 */
  get(name: string) {
    return this.list.get(name);
  }
  /** 获取快照 */
  snapshot() {
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
