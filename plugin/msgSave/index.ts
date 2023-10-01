import { RoomStatus } from "../..";
import { RoomInfo } from "../..";
import { FloatingLive } from "../..";
import MsgSave from "./msgSave";

export const messageSave = () => {
  return {
    name: "messageSave",
    register: (ctx: FloatingLive) => {
      const saveMessage = new MsgSave(ctx, {
        filePath: `./save`,
        sliceByStatus: true,
      });
      // 直播状态改变时，更新保存信息
      ctx.on(
        "room:status",
        (
          roomKey: string,
          status: RoomStatus,
          { timestamp }: { timestamp: number }
        ) => {
          const { platform, id } = ctx.room.get(roomKey)!.info;
          saveMessage.setSaveInfo({
            platform,
            room: id,
            status,
            timestamp,
            statusChanged: true,
          });
        }
      );
      // 打开直播间时，设置保存信息
      ctx.on("room:open", (roomKey: string, roomInfo: RoomInfo) => {
        const { platform, id, status } = roomInfo;
        saveMessage.setSaveInfo({
          platform,
          room: id,
          status,
          timestamp: Date.now(),
          statusChanged: false,
        });
      });
      // 关闭直播间时，移除保存信息
      ctx.on("room:close", (roomKey: string, roomInfo: RoomInfo) => {
        saveMessage.removeSaveInfo(roomKey);
      });
      ctx.on("live:message", (msg) => {
        saveMessage.write(msg, msg);
      });
      return saveMessage;
    },
  };
};

export const messageSaveRaw = () => {
  return {
    name: "messageSaveRaw",
    register: (ctx: FloatingLive) => {
      const saveRaw = new MsgSave(ctx, {
        filePath: `./save`,
        suffix: `.raw`,
      });
      // 打开直播间时，设置保存信息
      ctx.on("room:open", (roomKey: string, roomInfo: RoomInfo) => {
        const { platform, id, status } = roomInfo;
        saveRaw.setSaveInfo({
          platform,
          room: id,
          status,
          timestamp: Date.now(),
          statusChanged: false,
        });
      });
      // 关闭直播间时，移除保存信息
      ctx.on("room:close", (roomKey: string, roomInfo: RoomInfo) => {
        saveRaw.removeSaveInfo(roomKey);
      });
      ctx.on("live:raw", (msg, { platform, room }) => {
        saveRaw.write(msg, { platform, room });
      });
      saveRaw.start();
      return saveRaw;
    },
  };
};
