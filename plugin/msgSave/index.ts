import FloatingLive from "../../src";
import msgSave from "../msgSave/msgSave";

export const messageSave = (ctx: FloatingLive) => {
  let saveMessage = new msgSave(ctx, "live_message", `./save/undefined.txt`, ctx.controller.started)
  ctx.on("start", () => {
    let startDate = new Date(ctx.controller.timestamp)
    let fileId = `${startDate.getFullYear()}${(startDate.getMonth() + 1).toString().padStart(2, '0')}${startDate.getDate().toString().padStart(2, '0')}_${startDate.getHours().toString().padStart(2, '0')}${startDate.getMinutes().toString().padStart(2, '0')}${startDate.getSeconds().toString().padStart(2, '0')}-${String(ctx.controller.room.keyList[0]).replace(":", "-")}`
    saveMessage.changeFile(`./save/${fileId}.txt`)
    saveMessage.start()
  })
  ctx.on("end", () => { saveMessage.pause() })
  return saveMessage
}

export const messageSaveOrigin = (ctx: FloatingLive) => {
  let saveOrigin = new msgSave(ctx, "live_origin", `./save/undefined-origin.txt`, ctx.controller.started)
  ctx.on("start", () => {
    let startDate = new Date(ctx.controller.timestamp)
    let fileId = `${startDate.getFullYear()}${(startDate.getMonth() + 1).toString().padStart(2, '0')}${startDate.getDate().toString().padStart(2, '0')}_${startDate.getHours().toString().padStart(2, '0')}${startDate.getMinutes().toString().padStart(2, '0')}${startDate.getSeconds().toString().padStart(2, '0')}-${String(ctx.controller.room.keyList[0]).replace(":", "-")}`
    saveOrigin.changeFile(`./save/${fileId}-origin.txt`)
    saveOrigin.start()
  })
  ctx.on("end", () => { saveOrigin.pause() })
  return saveOrigin
}