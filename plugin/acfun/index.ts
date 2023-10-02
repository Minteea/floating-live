import { FloatingLive } from "../../src/index";
import { FloatingLivePlugin } from "../../src/types";
import acfunLive from "./acfunLive";

const acfun: FloatingLivePlugin = () => {
  return {
    name: "acfun",
    register: (ctx: FloatingLive) => {
      ctx.room.generator.register(
        "acfun",
        (id: string | number, open?: boolean) => {
          return new acfunLive(Number(id), open);
        }
      );
    },
  };
};

export = acfun;
