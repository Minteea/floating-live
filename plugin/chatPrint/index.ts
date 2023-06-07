import { FloatingLive } from "../..";
import { chatPrint } from "./chatPrint";

export = () => {
  return {
    register: (ctx: FloatingLive) => {
      return new chatPrint(ctx)
    }
  }
}