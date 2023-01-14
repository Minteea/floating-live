import { EventEmitter } from "events";
import { Reglist } from "./lib/Reglist";
import { LiveRoom } from "./lib/LiveRoom";
import { MessageData } from "./types/message/MessageData";
import { PluginHandler } from "./module/Plugin";
import { RoomController } from "./module/Room";

export class FloatingLive extends EventEmitter {
  /** 房间控制模块 */
  public room: RoomController;
  /** 插件处理模块 */
  public plugin: PluginHandler<this>;
  public helper: {
    /** 房间生成器 */
    roomGenerator: Reglist<(id: string | number, open?: boolean) => LiveRoom>,
    /** 消息处理 */
    messageHandler: Reglist<(msg: MessageData) => void>,
    /** 插件销毁 */
    pluginDestory: Reglist<() => void>,
    /** 添加插件 */
    pluginAddHandler: Reglist<(name: string) => void>,
    /** 移除插件 */
    pluginRemoveHandler: Reglist<(name: string) => void>,
  }
  /** 插件事件注册表 */
  private pluginEventMap = new Map<string, [string, (...args: any[]) => void][]>()
  /** 状态 */
  private status = {
    started: false,
    timestamp: 0,
  }
  get started(): boolean {
    return this.status.started
  }
  get timestamp(): number {
    return this.status.timestamp
  }

  constructor() {
    super();
    this.helper = {
      roomGenerator: new Reglist(this, "roomGenerator"),
      messageHandler: new Reglist(this, "messageHandler"),
      pluginDestory: new Reglist(this, "pluginDestory"),
      pluginAddHandler: new Reglist(this, "pluginAddHandler"),
      pluginRemoveHandler: new Reglist(this, "pluginRemoveHandler"),
    }
    this.room = new RoomController(this)
    this.plugin = new PluginHandler(this)
    this.init()
  }

  /** 初始化 */
  private init() {
    this.on("room_open", () => {
      this.started || this.start()
    })
    this.helper.pluginRemoveHandler.register("removePluginEvent", (name: string) => {
      this.pluginEventMap.get(name)?.forEach(([eventName, listener]) => {
        this.removeListener(eventName, listener)
      })
    })
  }
  
  /** 开始 */
  start() {
    this.status.started = true
    this.status.timestamp = new Date().valueOf()
    this.emit("start", this.timestamp)
  }
  /** 结束 */
  end() {
    this.closeAllRooms()
    this.status.started = false
    this.emit("end", this.timestamp)
    this.status.timestamp = 0
  }
  /** 添加房间 */
  addRoom({platform, id}: {platform: string, id: string | number}, open?: boolean) {
    let generated = this.room.generate({platform, id}, open)
    if (generated) {
      this.room.add(generated)
    }
  }
  /** 移除房间 */
  removeRoom(roomKey: string) {
    this.room.remove(roomKey)
  }
  /** 添加房间实例 */
  addLiveRoom(room: LiveRoom) {
    this.room.add(room)
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
  /** 重写事件监听 */
  on(eventName: string, listener: (...args: any[]) => void) {
    super.on(eventName, listener)
    // 检测是否为插件添加事件，并添加进事件列表
    if (this.plugin.currentPlugin) {
      if (!this.pluginEventMap.has(this.plugin.currentPlugin)) {
        this.pluginEventMap.set(this.plugin.currentPlugin, [])
      }
      this.pluginEventMap.get(this.plugin.currentPlugin)?.push([eventName, listener])
    }
    return this
  }
}
