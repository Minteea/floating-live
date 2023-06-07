const { FloatingLive } = require("../");
const chatPrint = require("../plugin/chatPrint");
const { messageSave, messageSaveOrigin } = require("../plugin/msgSave");
const bilibili = require("../plugin/bilibili");
const acfun = require("../plugin/acfun");
const consoleEvent = require("../plugin/consoleEvent");

const config = {
  rooms: [
    {
      platform: "bilibili",
      id: 6,
    },
    {
      platform: "acfun",
      id: 23512715,
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
