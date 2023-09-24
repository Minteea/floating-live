import { FloatingLive } from "../../src/index";
import acfunLive from "./acfunLive";

export = () => {
  return {
    name: "acfun",
    register: (ctx: FloatingLive) => {
      ctx.rooms.generator.register(
        "acfun",
        (id: string | number, open?: boolean) => {
          return new acfunLive(Number(id), open);
        }
      );
    },
  };
};
