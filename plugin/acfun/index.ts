import FloatingLive from "../../src/index"
import acfunLive from "./acfunLive"

export = (ctx: FloatingLive) => {
  ctx.helper.roomGenerator.register("acfun", (id: string | number, open?: boolean) => {  
    let key = `acfun:${Number(id)}`
    let room = new acfunLive(Number(id), open)
    return {key, room}
  })
}