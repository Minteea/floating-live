import FloatingLive from "..";
import LiveRoom from "../types/room/LiveRoom";
import Message from "./Message";
import Room from "./Room";

export default class Controller {
  readonly main: FloatingLive
  /** room 控制模块 */
  public readonly room: Room
  /** message 控制模块 */
  public readonly message: Message
  /** 开始时间戳 */
  timestamp: number = 0
  /** 开始状态 */
  started: boolean = false
  constructor(main: FloatingLive) {
    this.main = main
    this.room = new Room(this)
    this.message = new Message(this)
    this.main.on("room_open", () => {
      this.start()
    })
  }
  /** 开始 */
  start() {
    this.started = true
    this.timestamp = new Date().valueOf()
    this.main.emit("start", this.timestamp)
  }
  /** 结束 */
  end() {
    this.closeAllRooms()
    this.started = false
    this.main.emit("end", this.timestamp)
    this.timestamp = 0
  }
  /** 添加房间 */
  addRoom({platform, id}: {platform: string, id: string | number}, open?: boolean) {
    let generated = this.room.generate({platform, id}, open)
    if (generated) {
      this.room.add(generated.key, generated.room)
    }
  }
  /** 移除房间 */
  removeRoom(roomKey: string) {
    this.room.remove(roomKey)
  }
  /** 添加房间实例 */
  addLiveRoom(key: string, room: LiveRoom) {
    this.room.add(key, room)
  }
  /** 打开房间 */
  openRoom(roomKey: string) {
    this.room.open(roomKey)
  }
  /** 关闭房间 */
  closeRoom(roomKey: string) {
    this.room.close(roomKey)
  }
  /** 打开所有房间 */
  openAllRooms() {
    this.room.keyList.forEach((key) => {
      this.room.open(key)
    })
  }
  /** 关闭所有房间 */
  closeAllRooms() {
    this.room.keyList.forEach((key) => {
      this.room.close(key)
    })
  }
  /** 更新房间信息 */
  updateRoomInfo(roomKey: string) {
    this.room.update(roomKey)
  }
}