import FloatingLive from "../../src";

export = (ctx: FloatingLive) => {
  ctx.on("start", () => {
    console.log(`[controller]记录已开始: ${ctx.controller.timestamp}`)
  })
  ctx.on("end", () => {
    console.log(`[controller]记录已结束: ${ctx.controller.timestamp}`)
  })
  ctx.on("room_connect", (key) => {
    console.log(`[${key}]已连接到直播服务器`)
  })
  ctx.on("room_disconnect", (key) => {
    console.log(`[${key}]与直播服务器的连接已断开`)
  })
  ctx.on("room_info", (key) => {
    console.log(`[${key}]已获取到房间信息`)
  })
  ctx.on("room_update", (key) => {
    console.log(`[${key}]直播间信息更新`)
  })
  ctx.on("room_open", (key) => {
    console.log(`[${key}]房间已打开`)
  })
  ctx.on("room_close", (key) => {
    console.log(`[${key}]房间已关闭`)
  })
  ctx.on("room_add", (key) => {
    console.log(`[room]已添加房间: ${key}`)
  })
  ctx.on("room_remove", (key) => {
    console.log(`[room]已移除房间: ${key}`)
  })
  ctx.on("room_exist", (key) => {
    console.log(`[room]房间已存在: ${key}`)
  })
  ctx.on("room_unexist", (key) => {
    console.log(`[room]房间不存在: ${key}`)
  })
}