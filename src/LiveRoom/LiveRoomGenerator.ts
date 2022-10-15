import bilibiliLive from "../Platform/bilibiliLive"
import acfunLive from "../Platform/acfunLive"
import LiveRoom from "./LiveRoom"

type PlatformGenerator = (id: string | number, open?: boolean) => {key: string, room: LiveRoom}

/** 直播间监听实例生成器 */
class LiveRoomGenerator {
  private generatorMap: Map<string, PlatformGenerator> = new Map()
  constructor() {
    this.addPlatform("bilibili", (id: string | number, open?: boolean) => {
      let key = `bilibili:${Number(id)}`
      let room = new bilibiliLive(Number(id), open)
      return {key, room}
    })
    this.addPlatform("acfun", (id: string | number, open?: boolean) => {  
      let key = `acfun:${Number(id)}`
      let room = new acfunLive(Number(id), open)
      return {key, room}
    })
  }
  /** 生成一个房间 */
  public generate(r: string | {platform: string, id: string | number}, open?: boolean) {
    let platform: string
    let id: string | number
    if (typeof r == "string") {
      let arr = r.split(":")
      platform = arr[0].toLowerCase()
      id = arr[1]
    } else {
      platform = r.platform.toLowerCase()
      id = r.id
    }
    let platformGenerator = this.generatorMap.get(platform)
    if (platformGenerator) {
      return platformGenerator(id, open)
    } else {
      console.log(`[LiveRoomGenerator]不支持该平台:${platform}`)
    }
  }
  addPlatform(platform: string, generator: PlatformGenerator) {
    this.generatorMap.set(platform, generator)
  }
}

export default LiveRoomGenerator