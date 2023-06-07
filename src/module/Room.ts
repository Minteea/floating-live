import { LiveRoom, RoomViewInfo, RoomStatsInfo } from "../lib/LiveRoom";

import { FloatingLive } from "..";
import { MessageData } from "../types/message/MessageData";
import { RoomStatus } from "../enum";

/** 直播间监听实例控制器 */
export class RoomController {
  readonly main: FloatingLive
  private roomMap: Map<string, LiveRoom> = new Map();
  constructor(main: FloatingLive) {
    this.main = main
  }
  public generate(r: {platform: string, id: string | number}, open?: boolean) {
    let platform: string
    let id: string | number
    platform = r.platform.toLowerCase()
    id = r.id
    let platformGenerator = this.main.helper.roomGenerator.get(platform)
    if (platformGenerator) {
      return platformGenerator(id, open)
    } else {
      this.main.emit("room_unknown_platform", platform)
    }
  }
  /** 添加房间监听对象 */
  public add(room: LiveRoom, open?: boolean) {
    let key = room.key
    if (this.roomMap.has(key)) {
      this.main.emit("room_exist", key)
      return
    }
    this.roomMap.set(key, room);
    // 添加监听事件
    // 直播消息
    room.on("msg", (data: MessageData) => {
      this.main.helper.messageHandler.getList().forEach((handler) => {
        handler(data)
      })
      this.main.emit("live_message", data)
    })
    // 直播消息源数据
    room.on("origin", (data: any, {platform, room}: {platform: string, room: string | number}) => {
      this.main.emit("live_origin", data, {platform, room})
    })
    // 连接到直播间
    room.on("connect", () => {
      this.main.emit("room_connect", key)
    })
    // 与直播间的连接已断开
    room.on("disconnect", () => {
      this.main.emit("room_disconnect", key)
    })
    // 获取房间信息
    room.on("info", () => {
      this.main.emit("room_info", key, room.info)
    })
    // 直播展示信息更改
    room.on("view", (data: Partial<RoomViewInfo>) => {
      this.main.emit("room_view", key, data)
    })
    // 直播状态更改
    room.on("status", (status: RoomStatus, {id, timestamp}: {id?: string, timestamp: number}) => {
      this.main.emit("room_status", key, status, {id, timestamp})
    })
    // 统计数据更新
    room.on("stats", (data: Partial<RoomStatsInfo>) => {
      this.main.emit("room_stats", key, data)
    })
    // 房间被打开
    room.on("open", () => {
      this.main.emit("room_open", key, room.info)
    })
    // 房间被关闭
    room.on("close", () => {
      this.main.emit("room_close", key, room.info)
    })
    if(open) {
      room.open()
    }
    this.main.emit("room_add", key, room.info)
  }
  /** 移除房间 */
  public remove(roomKey: string) {
    if (!this.roomMap.has(roomKey)) {
      this.main.emit("room_unexist", roomKey)
      return
    }
    let room = this.roomMap.get(roomKey);
    this.roomMap.delete(roomKey)  // 从表中删除房间
    room?.removeAllListeners()    // 移除房间监听实例
    this.main.emit("room_remove", roomKey)
  }
  /** 获取房间 */
  public get(roomKey: string) {
    return this.roomMap.get(roomKey);
  }
  /** 获取房间信息 */
  public info(roomKey: string) {
    let room = this.roomMap.get(roomKey)
    return room ? room.info : undefined
  }
  /** 更新房间信息 */
  public update(roomKey: string) {
    let room = this.roomMap.get(roomKey)
    room && room.getInfo()
  }
  /** 获取roomKey列表 */
  get keyList(): Array<string> {
    return [...this.roomMap.keys()];
  }
  open(roomKey: string) {
    let room = this.roomMap.get(roomKey)
    room?.available && !room.opening && room.open()
  }
  close(roomKey: string) {
    let room = this.roomMap.get(roomKey)
    room?.opening && room.close()
  }
}
