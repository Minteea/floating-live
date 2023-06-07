import { MessageRoomInfo } from './../types/message/MessageData';
import { EventEmitter } from "events";
import { RoomStatus } from "../enum";
import { MessageData, MedalInfo, UserInfo } from "../../src/types";

export interface RoomInfo {
  /** 平台id */
  platform: string;
  /** 房间id */
  id: number | string;
  /** 房间key */
  key: string;
  /** 基本信息 */
  view: RoomViewInfo;
  /** 统计信息 */
  stats?: RoomStatsInfo;
  /** 主播信息 */
  anchor: UserInfo;
  /** 时间戳 */
  timestamp: number;
  /** 当前直播id */
  liveId?: string
  /** 直播状态 */
  status: RoomStatus;
  /** 直播间是否可用 */
  available: boolean;
  /** 房间监听是否打开 */
  opening: boolean;
  /** 是否连接到房间 */
  connected: boolean;
}

/** 房间展示信息 */
export type RoomViewInfo = {
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

export abstract class LiveRoom extends EventEmitter implements RoomInfo {
  constructor() {
    super()
  }
  /** 平台 */
  abstract readonly platform: string
  /** 房间id */
  abstract readonly id: string | number
  /** 基本信息 */
  abstract view: RoomViewInfo
  /** 统计信息 */
  stats?: RoomStatsInfo
  /** 主播信息 */
  abstract anchor: UserInfo
  /** 直播状态 */
  status: RoomStatus = RoomStatus.off
  /** 时间戳 */
  timestamp: number = 0
  /** 当前直播id */
  liveId?: string
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
    // 其他消息 => 先更改状态再发送消息
    // 直播结束消息 => 先发送消息再更改状态
    switch (msg.type) {
      case "live_start":
        this.status = RoomStatus.live
        this.timestamp = msg.timestamp
        this.emit("status", RoomStatus.live, {timestamp: msg.timestamp, id: msg.info.id})
      break
      case "live_view":
        this.view = Object.assign(this.view, msg.info)
        this.emit("view", msg.info)
      break
      case "live_stats":
        this.stats = Object.assign(this.stats!, msg.info)
        this.emit("stats", msg.info)
      break
      case "live_end":
      case "live_cut":
        this.emit("msg", msg)
        this.status = msg.status || RoomStatus.off
        this.timestamp = msg.timestamp
        this.emit("status", msg.status || RoomStatus.off, {timestamp: msg.timestamp})
      return
    }
    this.emit("msg", msg)
  }
  // 发送源消息
  protected emitOrigin(msg: any) {
    this.emit("origin", msg, {platform: this.platform, room: this.id})
  }
  get info(): RoomInfo {
    return {
      platform: this.platform,
      id: this.id,
      view: this.view,
      stats: this.stats,
      anchor: this.anchor,
      timestamp: this.timestamp,
      status: this.status,
      liveId: this.liveId,
      available: this.available,
      opening: this.opening,
      connected: this.connected,
      key: this.key,
    }
  }
  get key(): string {
    return `${this.platform}:${this.id}`
  }
}
