import { FloatingLive } from "../.."
import bilibiliLive from "./bilibiliLive"

export = () => {
  return {
    register: (ctx: FloatingLive) => {
      ctx.helper.roomGenerator.register("bilibili", (id: string | number, open?: boolean) => {
        return new bilibiliLive(Number(id), open)
      })
    }
  }
}