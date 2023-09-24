import { FloatingLive } from "../..";
import { chatPrint } from "./chatPrint";

export = () => {
  return {
    name: "chatPrint",
    register: (ctx: FloatingLive) => {
      return new chatPrint(ctx);
    },
  };
};
