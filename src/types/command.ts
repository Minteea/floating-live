import { LiveRoom } from "../core";
import { RoomInfo } from "./room";
import { FloatingValueMap } from "./value";

export interface FloatingCommandMap {
  /** 添加房间 */
  add: (
    platform: string,
    id: number,
    options?: boolean | Record<string, any>
  ) => void;
  /** 移除房间 */
  remove: (key: string) => void;
  /** 打开房间 */
  open: (key: string) => void;
  /** 关闭房间 */
  close: (key: string) => void;
  /** 更新房间信息 */
  update: (key: string) => void;
  /** 创建房间 */
  [name: `${string}.room.create`]: (
    id: string | number,
    options?: Record<string, any>
  ) => Promise<LiveRoom> | LiveRoom;
  /** 获取房间信息 */
  [name: `${string}.room.info`]: (id: string | number) => Promise<RoomInfo>;
  /** 获取值 */
  get: <N extends keyof FloatingValueMap>(name: N) => FloatingValueMap[N];
  /** 设置值 */
  set: <N extends keyof FloatingValueMap>(
    name: N,
    value: FloatingValueMap[N]
  ) => boolean;
}
