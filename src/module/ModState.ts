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
}
