import { RoomStatus } from './../../src/enum';
import { RoomInfo } from './../../src/lib/LiveRoom';
import { FloatingLive } from "../../src";
import MsgSave from "../msgSave/msgSave";

export const messageSave = () => {
  return {
    register: (ctx: FloatingLive) => {
      const saveMessage = new MsgSave(ctx,
      {
        filePath: `./save`,
        sliceByStatus: true,
      })
      // 直播状态改变时，更新保存信息
      ctx.on("room_status", (roomKey: string, status: RoomStatus, {timestamp}: {timestamp: number}) => {
        const {platform, id} = ctx.room.get(roomKey)!.info
        saveMessage.setSaveInfo({
          platform,
          room: id,
          status,
          timestamp,
          statusChanged: true
        })
      })
      // 打开直播间时，设置保存信息
      ctx.on("room_open", (roomKey: string, roomInfo: RoomInfo) => {
        const {platform, id, status} = roomInfo
        saveMessage.setSaveInfo({
          platform,
          room: id,
          status,
          timestamp: Date.now(),
          statusChanged: false
        })
      })
      // 关闭直播间时，移除保存信息
      ctx.on("room_close", (roomKey: string, roomInfo: RoomInfo) => {
        saveMessage.removeSaveInfo(roomKey)
      })
      ctx.on("live_message", (msg) => {
        saveMessage.write(msg, msg)
      })
      ctx.on("start", () => {
        saveMessage.start()
      })
      ctx.on("end", () => { saveMessage.pause() })
      return saveMessage
    }
  }
}

export const messageSaveOrigin = () => {
  return {
    register: (ctx: FloatingLive) => {
      const saveOrigin = new MsgSave(ctx, 
      {
        filePath: `./save`,
        suffix: `.origin`,
      })
      // 打开直播间时，设置保存信息
      ctx.on("room_open", (roomKey: string, roomInfo: RoomInfo) => {
        const {platform, id, status} = roomInfo
        saveOrigin.setSaveInfo({
          platform,
          room: id,
          status,
          timestamp: Date.now(),
          statusChanged: false
        })
      })
      // 关闭直播间时，移除保存信息
      ctx.on("room_close", (roomKey: string, roomInfo: RoomInfo) => {
        saveOrigin.removeSaveInfo(roomKey)
      })
      ctx.on("live_origin", (msg, {platform, room}) => {
        saveOrigin.write(msg, {platform, room})
      })
      ctx.on("start", () => {
        saveOrigin.start()
      })
      ctx.on("end", () => { saveOrigin.pause() })
      return saveOrigin
    }
  }
}
