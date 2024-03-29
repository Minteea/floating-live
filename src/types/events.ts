import { RoomStatus } from "../enums";
import { Message } from "./message";
import { RoomDetail, RoomInfo, RoomStatsInfo } from "./room";

export interface FloatingEventMap {
  "live:message": (msg: Message.All) => void;
  "live:raw": (
    data: any,
    { platform, room }: { platform: string; room: string | number }
  ) => void;
  "room:connecting": (key: string) => void;
  "room:connected": (key: string) => void;
  "room:enter": (key: string) => void;
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
  "room:remove": (key: string) => void;
  "room:move": (key: string, position: number) => void;

  "plugin:add": (name: string) => void;
  "plugin:remove": (name: string) => void;
  "command:add": (name: string) => void;
  "command:remove": (name: string) => void;
  "manifest:add": (name: string, id: string, value: any) => void;
  "manifest:remove": (name: string, id: string) => void;
  "hook:add": (name: string) => void;
  "hook:remove": (name: string) => void;

  "value:add": (name: string) => void;
  "value:remove": (name: string) => void;
  "value:change": (name: string, value: any) => void;
  [name: `change:${string}`]: (value: any) => void;

  event: (eventName: string, ...args: any[]) => void;

  error: (err: Error) => void;
}
