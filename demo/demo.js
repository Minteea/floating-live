const { FloatingLive } = require("../");
const chatPrint = require("../plugin/chatPrint");
const { messageSave, messageSaveRaw } = require("../plugin/msgSave");
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
};

// 创建live实例
const live = new FloatingLive();
live.plugin.register(consoleEvent);
live.plugin.register(bilibili);
live.plugin.register(acfun);

// 初始化内置插件
live.plugin.register(chatPrint);
live.plugin.register(messageSave);
live.plugin.register(messageSaveRaw);

// 此处可设置自己的b站登录凭据，以解除b站未登录状态下返回打码弹幕的限制
// b站的登录凭据可在cookie中获取，注意不要将cookie泄露给其他人
live.room.setAuth("bilibili", "SESSDATA=xxxxxxxxxxxxxxxxxxxx");

config.rooms.forEach(({ platform, id }) => {
  live.addRoom(platform, id, config.open);
});

console.log("Floating Live is on :)");
