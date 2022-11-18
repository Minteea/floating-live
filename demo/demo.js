const FloatingLive = require("../");
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
  ],
  open: true,
}

// 创建living实例
const live = new FloatingLive();
live.registerPlugin("consoleEvent", consoleEvent)
live.registerPlugin("bilibiliLive", bilibili)
live.registerPlugin("acfun", acfun)

// 初始化内置插件
live.registerPlugin("chatPrint", chatPrint)
live.registerPlugin("messageSave", messageSave)
live.registerPlugin("messageSaveOrigin", messageSaveOrigin)

config.rooms.forEach((room) => {
  live.controller.addRoom(room, config.open)
})

console.log("Floating Live is on :)");
