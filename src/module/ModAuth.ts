import { Reglist } from "../abstract/Reglist";
import { FloatingLive } from "..";

export class ModAuth {
  public options: Reglist<object>;
  main: FloatingLive;
  constructor(main: FloatingLive) {
    this.options = new Reglist(main, "auth.options");
    this.main = main;
  }
  set(name: string, auth: string) {
    return this.main.rooms.setAuth(name, auth);
  }
}
