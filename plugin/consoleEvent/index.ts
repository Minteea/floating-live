import { FloatingLive } from "../..";

const initEventConsole = (ctx: FloatingLive) => {
  ctx.on("room:connect", (key) => {
    console.log(`[${key}]已连接到直播服务器`);
  });
  ctx.on("room:disconnect", (key) => {
    console.log(`[${key}]与直播服务器的连接已断开`);
  });
  ctx.on("room:info", (key) => {
    console.log(`[${key}]已获取到房间信息`);
  });
  ctx.on("room:update", (key) => {
    console.log(`[${key}]直播间信息更新`);
  });
  ctx.on("room:open", (key) => {
    console.log(`[${key}]房间已打开`);
  });
  ctx.on("room:close", (key) => {
    console.log(`[${key}]房间已关闭`);
  });
  ctx.on("room:add", (key) => {
    console.log(`[room]已添加房间: ${key}`);
  });
  ctx.on("room:remove", (key) => {
    console.log(`[room]已移除房间: ${key}`);
  });
  ctx.on("room:exist", (key) => {
    console.log(`[room]房间已存在: ${key}`);
  });
  ctx.on("room:unexist", (key) => {
    console.log(`[room]房间不存在: ${key}`);
  });
  ctx.on("plugin:add", (name) => {
    console.log(`[plugin]已添加插件: ${name}`);
  });
  ctx.on("plugin:remove", (name) => {
    console.log(`[plugin]已移除插件: ${name}`);
  });
  ctx.on("plugin:unexist", (name) => {
    console.log(`[plugin]插件不存在: ${name}`);
  });
  ctx.on("plugin:duplicate", (name) => {
    console.log(`[plugin]插件名称重复: ${name}`);
  });
};

export = () => {
  return {
    name: "consoleEvent",
    register: initEventConsole,
  };
};
