import { FloatingLive } from "../";
import chatPrint from "../plugin/chatPrint";
import { messageSave, messageSaveOrigin } from "../plugin/msgSave";
import bilibili from "../plugin/bilibili";
import acfun from "../plugin/acfun";
import consoleEvent from "../plugin/consoleEvent"

const config = {
  rooms: [
    {
      platform: "acfun",
      id: 36626547,
    },
  ],
  open: true,
}

// 创建live实例
const live = new FloatingLive();
live.plugin.register("consoleEvent", consoleEvent)
live.plugin.register("bilibili", bilibili)
live.plugin.register("acfun", acfun)

// 初始化内置插件
live.plugin.register("chatPrint", chatPrint)
live.plugin.register("messageSave", messageSave)
live.plugin.register("messageSaveOrigin", messageSaveOrigin)

config.rooms.forEach((room) => {
  live.addRoom(room, config.open)
})

console.log("Floating Live is on :)");
