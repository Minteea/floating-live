import { FloatingLive } from "../../src/index"
import acfunLive from "./acfunLive"

export = () => {
  return {
    register: (ctx: FloatingLive) => {
      ctx.helper.roomGenerator.register("acfun", (id: string | number, open?: boolean) => {  
        return new acfunLive(Number(id), open)
      })
    }
  }
}