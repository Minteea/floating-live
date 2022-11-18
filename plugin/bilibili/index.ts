import FloatingLive from "../../src/index"
import bilibiliLive from "./bilibiliLive"

export = (ctx: FloatingLive) => {
  ctx.helper.roomGenerator.register("bilibili", (id: string | number, open?: boolean) => {
    let key = `bilibili:${Number(id)}`
    let room = new bilibiliLive(Number(id), open)
    return {key, room}
  })
}