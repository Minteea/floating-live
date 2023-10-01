import { Reglist } from "../abstract/Reglist";
import { FloatingLive } from "..";

export class ModAuth {
  public options: Reglist<object>;
  main: FloatingLive;
  constructor(main: FloatingLive) {
    this.options = new Reglist(main, "auth.options");
    this.main = main;
    this.main.state.register("auth", () => {
      const options: Record<string, object> = {};
      this.options.forEach((val, key) => {
        options[key] = val;
      });
      return {
        options: options,
      };
    });
    this.main.command.batchRegister({
      auth: (platform, auth) => {
        this.set(platform, auth);
      },
    });
  }
  set(name: string, auth: string) {
    this.main.room.setAuth(name, auth);
  }
}
