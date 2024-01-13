import { RoomStatus } from "../enums";
import { Message } from "./message";
import { RoomDetail, RoomInfo, RoomStatsInfo } from "./room";

export interface FloatingEventMap {
  "live:message": (msg: Message.All) => void;
  "live:raw": (data: any) => void;
  "room:connect": (key: string) => void;
  "room:disconnect": (key: string) => void;
  "room:info": (key: string, info: RoomInfo) => void;
  "room:detail": (key: string, info: RoomDetail) => void;
  "room:status": (
    key: string,
    info: { status: RoomStatus; id?: string; timestamp?: number }
  ) => void;
  "room:stats": (key: string, info: RoomStatsInfo) => void;
  "room:open": (key: string, info: RoomInfo) => void;
  "room:close": (key: string, info: RoomInfo) => void;
  "room:add": (key: string, info: RoomInfo) => void;
  "room:remove": (key: string, info: RoomInfo) => void;

  "plugin:add": (name: string) => void;
  "plugin:remove": (name: string) => void;
  "command:add": (name: string) => void;
  "command:remove": (name: string) => void;

  error: (err: Error) => void;
}
