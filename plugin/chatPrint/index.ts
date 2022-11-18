import FloatingLive from "../../src";
import chatPrint from "./chatPrint";

export = (ctx: FloatingLive) => {
  return new chatPrint(ctx)
}