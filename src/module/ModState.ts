import { FloatingLive } from "..";
import { Reglist } from "../abstract/Reglist";

export class ModState extends Reglist<() => object> {
  constructor(main: FloatingLive) {
    super(main, "state");
  }
  public generate() {
    const state: Record<string, any> = {};
    this.forEach((gen, key) => {
      state[key] = gen();
    });
    return state;
  }
  /** 设置一个值 */
  public set(name: string, value: any) {
    this.main.emit("state:set", name, value);
  }
  /** 在数组中添加一个值 */
  public arrayPush(name: string, value: any) {
    this.main.emit("state:array_push", name, value);
  }
  /** 在数组中移除一个值 */
  public arrayRemove(name: string, key: string, val: string) {
    this.main.emit("state:array_remove", name, key, val);
  }
}
