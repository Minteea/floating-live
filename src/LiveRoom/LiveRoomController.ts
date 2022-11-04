import LiveRoom from "./LiveRoom";

import { EventEmitter } from "events";
import LiveRoomGenerator from "./LiveRoomGenerator";

/** 直播间监听实例控制器 */
class LiveRoomController extends EventEmitter {
  /** 房间表 */
  public roomMap: Map<string, LiveRoom> = new Map();
  public liveRoomGenerator = new LiveRoomGenerator();
  constructor({rooms, opening}: {rooms?: Array<string | { platform: string; id: string | number }>, opening?: boolean}) {
    super();
    rooms?.forEach((r) => {
      this.addRoom(r, opening || false)
    })
  }
  /** 打开所有房间的消息获取 */
  public openAll() {
    this.roomMap.forEach((room: LiveRoom) => {
      room.open()
    })
  }
  /** 关闭所有房间的消息获取 */
  public closeAll() {
    this.roomMap.forEach((room: LiveRoom) => {
      room.close()
    })
  }
  /** 添加房间 */
  public addRoom(r: string | { platform: string; id: string | number }, open?: boolean) {
    let keyRoom = this.liveRoomGenerator.generate(r, open);
    if (!keyRoom) return;
    let { key, room }: { key: string; room: LiveRoom } = keyRoom
    if (this.roomMap.has(key)) {
      console.log(`[LiveRoomController] 房间已存在: ${key}`)
      this.emit("room", {status: "exist", roomKey: key})
      return
    }
    this.roomMap.set(key, room);
    room.on("msg", (data) => {
      this.emit("msg", data)
    })
    room.on("origin", (data) => {
      this.emit("origin", data)
    })
    room.on("connect", (data) => {
      this.emit("room", {status: "connected", roomKey: key})
    })
    room.on("disconnect", (data) => {
      this.emit("room", {status: "disconnected", roomKey: key})
    })
    console.log(`[LiveRoomController] 已添加房间: ${key}`)
    this.emit("room", {status: "added", roomKey: key})
  }
  /** 添加房间监听对象 */
  public addLiveRoom(room: LiveRoom, open?: boolean) {
    let roomKey = `${room.platform}:${room.id}`
    if (this.roomMap.has(roomKey)) {
      console.log(`[LiveRoomController] 房间已存在: ${roomKey}`)
      this.emit("room", {status: "exist", roomKey})
      return
    }
    this.roomMap.set(roomKey, room);
    room.on("msg", (data) => {
      this.emit("msg", data)
    })
    room.on("origin", (data) => {
      this.emit("origin", data)
    })
    if(open) {
      room.open()
    }
    this.emit("room", {status: "added", roomKey})
  }
  /** 移除房间 */
  public removeRoom(roomKey: string) {
    if (!this.roomMap.has(roomKey)) {
      console.log(`[LiveRoomController] 房间不存在: ${roomKey}:`)
      this.emit("room", {status: "unexist", roomKey})
      return
    }
    let room = this.roomMap.get(roomKey);
    this.roomMap.delete(roomKey)  // 从表中删除房间
    room?.destory() // 销毁房间监听实例
    console.log(`[LiveRoomController] 已移除房间: ${roomKey}:`)
    this.emit("room", {status: "removed", roomKey})
  }
  /** 获取房间 */
  public getRoom(r: string | { platform: string; id: string | number }) {
    let roomKey: string = typeof r == "object" ? this.roomKey(r) : r;
    return this.roomMap.get(roomKey);
  }
  /** 根据房间平台及id拼接为roomKey(房间标识符) */
  public roomKey({
    platform,
    id,
  }: {
    platform: string;
    id: string | number;
  }): string {
    return `${platform}:${id}`;
  }
  /** 根据roomKey获取房间平台及id */
  public roomKeyInfo(roomKey: string): {
    platform: string;
    id: string | number;
  } {
    let arr = roomKey.split(":");
    return { platform: arr[0], id: arr[1] };
  }
  /** 获取roomList属性: 房间列表 */
  get roomList(): Array<string> {
    return [...this.roomMap.keys()];
  }
}

export default LiveRoomController;
