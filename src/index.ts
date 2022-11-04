import { EventEmitter } from "events";
import ChatProcessor from "./Chat/ChatProcessor";
import getRoomInfo from "./LiveRoom/getRoomInfo";
import LiveRoom from "./LiveRoom/LiveRoom";
import LiveRoomController from "./LiveRoom/LiveRoomController";

class FloatingLiving extends EventEmitter {
  /** 房间监听控制模块 */
  liveRoomController: LiveRoomController;
  /** 聊天消息处理模块 */
  chatProcessor: ChatProcessor;
  /** 拓展插件 */
  plugin: Map<string, any> = new Map();
  /** 时间戳 */
  timestamp: number
  constructor({rooms, opening}: {rooms?: Array<string | { platform: string; id: string | number }>, opening?: boolean}) {
    super();
    this.timestamp = new Date().valueOf()
    this.liveRoomController = new LiveRoomController({rooms, opening});
    this.chatProcessor = new ChatProcessor();
    /** 从房间监听控制模块中获取并处理信息 */
    this.liveRoomController.on("msg", (msg) => {
      this.chatProcessor.process(msg)
      this.emit("msg", msg);
    });
    this.liveRoomController.on("origin", (msg) => {
      this.emit("origin", msg);
    });
    this.liveRoomController.on("room", (msg) => {
      this.emit("room", msg);
    });
  }
  /** 添加房间 */
  public addRoom(r: string | { platform: string; id: string | number; }, open?: boolean) {
    this.liveRoomController.addRoom(r, open)
  }
  /** 添加房间监听对象 */
  public addLiveRoom(liveRoom: LiveRoom, open?: boolean) {
    this.liveRoomController.addLiveRoom(liveRoom, open)
  }
  /** 删除房间 */
  public removeRoom(roomKey: string) {
    this.liveRoomController.removeRoom(roomKey)
  }
  /** 打开房间监听 */
  public openRoom(roomKey: string) {
    let room = this.liveRoomController.getRoom(roomKey)
    room?.open()
    this.emit("room", {status: room ? "opened" : "unexist", roomKey})
  }
  /** 关闭房间监听 */
  public closeRoom(roomKey: string) {
    let room = this.liveRoomController.getRoom(roomKey)
    room?.close()
    this.emit("room", {status: room ? "closed" : "unexist", roomKey})
  }
  /** 获取房间信息 */
  public getRoomInfo(roomKey: string) {
    let room = this.liveRoomController.getRoom(roomKey)
    if (room) return getRoomInfo(room);
  }
  /** 更新房间信息 */
  public async updateRoomInfo(roomKey: string) {
    return await this.liveRoomController.getRoom(roomKey)?.getInfo()
  }
  /** 添加插件 */
  public addPlugin(name: string, pluginFunc: (main: FloatingLiving) => any) {
    let pluginObject = pluginFunc(this)
    this.plugin.set(name, pluginObject)
    this.emit("plugin", {status: "added", name})
    return pluginObject
  }
  /** 根据名称获取插件 */
  public getPlugin(name: string) {
    return this.plugin.get(name)
  }
  /** 移除插件 */
  public removePlugin(name: string) {
    if (!this.plugin.has(name)) {
      this.emit("plugin", {status: "unexist", name})
      return
    };
    let pluginObject = this.plugin.get(name)
    this.plugin.delete(name)
    pluginObject.destory && pluginObject.destory()
    this.emit("plugin", {status: "removed", name})
  }
}
export default FloatingLiving