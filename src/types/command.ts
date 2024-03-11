import { LiveRoom } from "../core";
import { RoomInfo } from "./room";

export interface FloatingCommandMap {
  add: (
    platform: string,
    id: number,
    options?: boolean | Record<string, any>
  ) => void;
  remove: (key: string) => void;
  open: (key: string) => void;
  close: (key: string) => void;
  update: (key: string) => void;
  [name: `${string}.room.create`]: (
    id: string | number,
    options?: Record<string, any>
  ) => LiveRoom;
  [name: `${string}.room.info`]: (id: string | number) => RoomInfo;
}
