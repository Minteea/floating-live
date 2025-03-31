import { CustomEventEmitter } from "../utils/EventEmitter";
import { EnumValue } from "../utils/types";
import { LiveMessage } from "./message";
import { UserInfo } from "./messageInfo";

/** 直播间客户端API */
export abstract class LiveRoom
  extends CustomEventEmitter
  implements LiveRoomData
{
  constructor() {
    super();
  }
  /** 平台 */
  abstract readonly platform: string;
  /** 房间id */
  abstract readonly id: string | number;
  /** 房间详情 */
  abstract detail: LiveRoomDetailInfo;
  /** 统计信息 */
  stats?: LiveRoomStatsInfo;
  /** 主播信息 */
  abstract anchor: UserInfo;
  /** 直播状态 */
  status: LiveRoomStatus = LiveRoomStatus.off;
  /** 时间戳 */
  timestamp: number = 0;
  /** 当前直播id */
  liveId?: string;
  /** 房间是否打开 */
  opened: boolean = false;
  /** 房间连接状态 */
  connection: LiveConnectionStatus = LiveConnectionStatus.off;
  /** 房间是否可用 */
  abstract available: boolean;
  /** 打开连接 */
  abstract open(): void;
  /** 关闭连接 */
  abstract close(): void;
  /** 更新房间数据 */
  abstract update(): Promise<void>;
  /** 从服务器获取房间数据 */
  abstract fetchData?(): Promise<void>;
  /** 销毁 */
  public destroy() {
    this.close();
    this.onDestroy?.();
  }
  /** 销毁事件 */
  protected onDestroy?: () => void;
  // 发送消息
  protected emitMessage(msg: LiveMessage.All) {
    // 其他消息 => 先更改状态再发送消息
    // 直播结束消息 => 先发送消息再更改状态
    switch (msg.type) {
      case "live_start":
        this.status = LiveRoomStatus.live;
        this.timestamp = msg.timestamp;
        this.emit("status", {
          status: LiveRoomStatus.live,
          timestamp: msg.timestamp,
          liveId: msg.info.id,
        });
        break;
      case "live_detail":
        this.detail = Object.assign(this.detail, msg.info);
        this.emit("detail", { detail: msg.info });
        break;
      case "live_stats":
        this.stats = Object.assign(this.stats!, msg.info);
        this.emit("stats", { stats: msg.info });
        break;
      case "live_end":
      case "live_cut":
        this.status = msg.status || LiveRoomStatus.off;
        this.timestamp = msg.timestamp;
        this.emit("message", { message: msg });
        this.emit("status", {
          status: msg.status || LiveRoomStatus.off,
          timestamp: msg.timestamp,
          liveId: this.liveId,
        });
        return;
    }
    this.emit("message", { message: msg });
  }

  /** 发送源消息 */
  protected emitRaw(msg: any) {
    this.emit("raw", { platform: this.platform, roomId: this.id, data: msg });
  }

  /** 获取数据 */
  toData(): LiveRoomData {
    return {
      platform: this.platform,
      id: this.id,
      detail: this.detail,
      stats: this.stats,
      anchor: this.anchor,
      timestamp: this.timestamp,
      status: this.status,
      liveId: this.liveId,
      available: this.available,
      opened: this.opened,
      connection: this.connection,
      key: this.key,
    };
  }
  get key(): string {
    return `${this.platform}:${this.id}`;
  }
}

export interface LiveRoom {
  on<K extends keyof LiveRoomEventMap>(
    type: K,
    listener: (e: LiveRoomEventMap[K]) => void,
    signal?: AbortSignal
  ): void;

  once<K extends keyof LiveRoomEventMap>(
    type: K,
    listener: (e: LiveRoomEventMap[K]) => void,
    signal?: AbortSignal
  ): void;

  off<K extends keyof LiveRoomEventMap>(
    type: K,
    listener: (e: LiveRoomEventMap[K]) => void
  ): void;

  emit<K extends keyof LiveRoomEventMap>(
    type: LiveRoomEventMap[K] extends Record<string, never> ? K : never
  ): void;
  emit<K extends keyof LiveRoomEventMap>(
    type: K,
    detail: LiveRoomEventMap[K]
  ): void;
}

/** 房间数据 */
export interface LiveRoomData {
  /** 平台id */
  platform: string;
  /** 房间id */
  id: number | string;
  /** 房间key */
  key: string;
  /** 基本信息 */
  detail: LiveRoomDetailInfo;
  /** 统计信息 */
  stats?: LiveRoomStatsInfo;
  /** 主播信息 */
  anchor: UserInfo;
  /** 时间戳 */
  timestamp: number;
  /** 当前直播id */
  liveId?: string;
  /** 直播状态 */
  status: LiveRoomStatus;
  /** 直播间是否可用 */
  available: boolean;
  /** 房间监听是否打开 */
  opened: boolean;
  /** 房间连接状态 */
  connection: LiveConnectionStatus;
}

/** 房间展示信息 */
export interface LiveRoomDetailInfo {
  /** 直播标题 */
  title?: string;
  /** 分区 */
  area?: string[];
  /** 封面 */
  cover?: string;
}

/** 房间统计数据信息 */
export interface LiveRoomStatsInfo {
  /** 点赞数 */
  like?: number;
  /** 观看数 */
  view?: number;
  /** 在线人数 */
  online?: number;
  /** 人气值 */
  popularity?: number;
}

/** 直播间状态 */
export const LiveRoomStatus = {
  /** 未开播 */
  off: 0,
  /** 正在直播 */
  live: 1,
  /** 正在轮播 */
  round: 2,
  /** 被封禁 */
  banned: -1,
  /** 已上锁 */
  locked: -2,
} as const;
export type LiveRoomStatus = EnumValue<typeof LiveRoomStatus>;

/** 直播间状态 */
export const LiveConnectionStatus = {
  /** 未连接 */
  off: 0,
  /** 连接中 */
  connecting: 1,
  /** 连接到服务器 */
  connected: 2,
  /** 连接到房间 */
  entered: 3,
  /** 连接失败或断开 */
  disconnected: -1,
};
export type LiveConnectionStatus = EnumValue<typeof LiveConnectionStatus>;

export interface LiveRoomEventMap {
  /**  */
  status: {
    status: LiveRoomStatus;
    timestamp: number;
    liveId?: string | number;
  };
  /** 房间数据更新 */
  update: { room: LiveRoomData };
  /** 细节改变 */
  detail: { detail: Partial<LiveRoomDetailInfo> };
  /** 统计信息改变 */
  stats: { stats: Partial<LiveRoomStatsInfo> };

  /** 消息 */
  message: { message: LiveMessage.All };
  /** 消息源数据 */
  raw: { platform: string; roomId: string | number; data: any };

  /** 初始化 */
  init: {};
  /** 正在连接 */
  connecting: {};
  /** 连接到服务器 */
  connected: {};
  /** 断开连接 */
  disconnect: {};
  /** 连接到房间 */
  enter: {};
  /** 连接超时 */
  timeout: { time: number };

  /** 开启直播间连接 */
  open: {};
  /** 关闭直播间连接 */
  close: {};
}
