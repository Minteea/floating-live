import { EventEmitter } from "events";
import { MedalInfo, UserInfo } from "../types/message/AttributeInfo";
import { MessageData } from "../types/message/MessageData";

export interface RoomInfo {
  /** 平台id */
  platform: string;
  /** 房间id */
  id: number | string;
  /** 房间key */
  key: string;
  /** 基本信息 */
  base: RoomBaseInfo;
  /** 统计信息 */
  stats?: RoomStatsInfo;
  /** 主播信息 */
  anchor: UserInfo;
  /** 时间戳 */
  timestamp: number;
  /** 直播状态 */
  status: RoomStatus;
  /** 直播间是否可用 */
  available: boolean;
  /** 房间监听是否打开 */
  opening: boolean;
  /** 是否连接到房间 */
  connected: boolean;
}

/** 房间基本信息 */
export type RoomBaseInfo = {
  /** 直播标题 */
  title?: string
  /** 分区 */
  area?: string[]
  /** 封面 */
  cover?: string
}

/** 房间统计数据信息 */
export type RoomStatsInfo = {
  /** 点赞数 */
  like?: number
  /** 观看数 */
  watch?: number
  /** 在线人数 */
  online?: number
  /** 人气值 */
  popularity?: number
}

/** 房间状态 */
export type RoomStatus = "live" | "off" | "round" | "banned"

export abstract class LiveRoom extends EventEmitter implements RoomInfo {
  constructor() {
    super()
  }
  /** 平台 */
  abstract readonly platform: string
  /** 房间id */
  abstract readonly id: string | number
  /** 基本信息 */
  abstract base: RoomBaseInfo
  /** 统计信息 */
  stats?: RoomStatsInfo
  /** 主播信息 */
  abstract anchor: UserInfo
  /** 直播状态 */
  status: RoomStatus = "off"
  /** 时间戳 */
  timestamp: number = 0
  /** 房间是否打开 */
  opening: boolean = false
  /** 房间是否可用 */
  abstract available: boolean
  /** 是否连接上房间 */
  abstract connected: boolean
  /** 打开连接 */
  abstract open(): void
  /** 关闭连接 */
  abstract close(): void
  /** 从服务器获取信息 */
  abstract getInfo(): void
  /** 销毁事件 */
  protected onDestory?(): void
  /** 销毁 */
  public destory() {
    this.close()
    this.removeAllListeners()
    this.onDestory?.()
  }
  // 发送消息
  protected emitMsg(msg: MessageData) {
    this.msgCheck(msg)
    this.emit("msg", msg)
  }
  // 发送源消息
  protected emitOrigin(msg: any) {
    this.emit("origin", msg)
  }
  get info(): RoomInfo {
    return {
      platform: this.platform,
      id: this.id,
      base: this.base,
      stats: this.stats,
      anchor: this.anchor,
      timestamp: this.timestamp,
      status: this.status,
      available: this.available,
      opening: this.opening,
      connected: this.connected,
      key: this.key,
    }
  }
  get key(): string {
    return `${this.platform}:${this.id}`
  }
  // 检测特定消息
  private msgCheck(msg: MessageData) {
    switch (msg.type) {
      case "live_start":
        this.status = "live"
        this.timestamp = msg.info.timestamp || msg.record_time
        this.emit("status", "live", msg.info.timestamp)
      break
      case "live_end":
      case "live_cut":
        this.status = msg.info.status || "off"
        this.timestamp = msg.info.timestamp || msg.record_time
        this.emit("status", msg.info.status || "off", msg.info.timestamp || msg.record_time)
      break
      case "live_change":
        this.base = Object.assign(this.base, msg.info)
        this.emit("change", msg.info)
      break
      case "live_stats":
        this.stats = Object.assign(this.stats!, msg.info)
      break
    }
  }
}
