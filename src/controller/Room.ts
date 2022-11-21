import LiveRoom from "../types/room/LiveRoom";

import FloatingLive from "..";
import getRoomInfo from "../utils/getRoomInfo";
import Controller from ".";
import { MessageType } from "../types/message/MessageData";
import { LiveInfo } from "../types/room/LiveInfo";

/** 直播间监听实例控制器 */
class Room {
  readonly controller: Controller
  readonly main: FloatingLive
  private roomMap: Map<string, LiveRoom> = new Map();
  constructor(controller: Controller) {
    this.controller = controller
    this.main = controller.main
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
  public add(key: string, room: LiveRoom, open?: boolean) {
    if (this.roomMap.has(key)) {
      this.main.emit("room_exist", key)
      return
    }
    this.roomMap.set(key, room);
    // 添加监听事件
    // 直播消息
    room.on("msg", (data: MessageType) => {
      this.controller.message.send(data)
    })
    // 直播消息源数据
    room.on("origin", (data: any) => {
      this.main.emit("live_origin", data)
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
      this.main.emit("room_info", key, getRoomInfo(room))
    })
    // 直播信息更改
    room.on("change", (data: Partial<LiveInfo>) => {
      this.main.emit("room_change", key, data)
    })
    // 房间被打开
    room.on("open", () => {
      this.main.emit("room_open", key, getRoomInfo(room))
    })
    // 房间被关闭
    room.on("close", () => {
      this.main.emit("room_close", key, getRoomInfo(room))
    })
    if(open) {
      room.open()
    }
    this.main.emit("room_add", key, getRoomInfo(room))
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
    return room ? getRoomInfo(room) : undefined
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

export default Room;
