import { FloatingLive } from "../../src/index"
import bilibiliLive from "./bilibiliLive"

export = (ctx: FloatingLive) => {
  ctx.helper.roomGenerator.register("bilibili", (id: string | number, open?: boolean) => {
    return new bilibiliLive(Number(id), open)
  })
}