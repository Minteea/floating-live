import { FloatingLive } from "../live";
import { FloatingManifestMap } from "../types/manifest";

export class ModManifest {
  private list = new Map<string, Map<string, any>>();
  protected readonly main: FloatingLive;

  constructor(main: FloatingLive) {
    this.main = main;
  }
  /** 注册manifest */
  register<T extends keyof FloatingManifestMap>(
    name: T,
    id: string,
    value: FloatingManifestMap[T]
  ) {
    let store = this.list.get(name);
    if (!store) {
      store = new Map();
      this.list.set(name, store);
    }
    store.set(id, value);
    this.main.emit("manifest:add", name, id, value);
  }
  /** 取消注册manifest */
  unregister<T extends keyof FloatingManifestMap>(name: T, id: string): void {
    let store = this.list.get(name);
    if (store) {
      store.delete(id);
      this.main.emit("manifest:remove", name, id);
    }
  }
  /** 获取值 */
  get(name: string) {
    return this.list.get(name);
  }
  /** 获取快照 */
  getSnapshot() {
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
