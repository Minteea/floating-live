import { Reglist } from "../abstract/Reglist";
import { FloatingLive } from "..";
import { AuthOptions } from "../types/auth";

export class ModAuth {
  public options: Reglist<AuthOptions>;
  public status: Record<string, string | number> = {};
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
        status: this.status,
      };
    });
    this.main.command.batchRegister({
      auth: (platform, auth) => {
        if (this.main.command.has(`auth.${platform}`)) {
          this.main.command.execute(`auth.${platform}`, auth);
        } else {
          this.set(platform, auth);
        }
      },
    });
  }
  set(name: string, auth: string) {
    this.main.room.setAuth(name, auth);
  }
}
