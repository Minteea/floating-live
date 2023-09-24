import { EventEmitter } from "events";
import { RoomStatus } from "../enum";
import { RoomDetail, RoomInfo, RoomStatsInfo } from "../types";
import { Message, MedalInfo, UserInfo } from "../types/message";

export abstract class LiveRoom extends EventEmitter implements RoomInfo {
  constructor() {
    super();
  }
  /** 平台 */
  abstract readonly platform: string;
  /** 房间id */
  abstract readonly id: string | number;
  /** 房间详情 */
  abstract detail: RoomDetail;
  /** 统计信息 */
  stats?: RoomStatsInfo;
  /** 主播信息 */
  abstract anchor: UserInfo;
  /** 直播状态 */
  status: RoomStatus = RoomStatus.off;
  /** 时间戳 */
  timestamp: number = 0;
  /** 当前直播id */
  liveId?: string;
  /** 房间是否打开 */
  opened: boolean = false;
  /** 房间是否可用 */
  abstract available: boolean;
  /** 是否连接上房间 */
  abstract connected: boolean;
  /** 打开连接 */
  abstract open(): void;
  /** 关闭连接 */
  abstract close(): void;
  /** 从服务器获取信息 */
  abstract getInfo(): void;
  /** 销毁事件 */
  protected onDestory?(): void;
  /** 销毁 */
  public destroy() {
    this.close();
    this.removeAllListeners();
    this.onDestory?.();
  }
  // 发送消息
  protected emitMsg(msg: Message.All) {
    // 其他消息 => 先更改状态再发送消息
    // 直播结束消息 => 先发送消息再更改状态
    switch (msg.type) {
      case "live_start":
        this.status = RoomStatus.live;
        this.timestamp = msg.timestamp;
        this.emit("status", RoomStatus.live, {
          timestamp: msg.timestamp,
          id: msg.info.id,
        });
        break;
      case "live_detail":
        this.detail = Object.assign(this.detail, msg.info);
        this.emit("detail", msg.info);
        break;
      case "live_stats":
        this.stats = Object.assign(this.stats!, msg.info);
        this.emit("stats", msg.info);
        break;
      case "live_end":
      case "live_cut":
        this.emit("msg", msg);
        this.status = msg.status || RoomStatus.off;
        this.timestamp = msg.timestamp;
        this.emit("status", msg.status || RoomStatus.off, {
          timestamp: msg.timestamp,
        });
        return;
    }
    this.emit("msg", msg);
  }
  // 发送源消息
  protected emitRaw(msg: any) {
    this.emit("raw", msg, { platform: this.platform, room: this.id });
  }
  get info(): RoomInfo {
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
      connected: this.connected,
      key: this.key,
    };
  }
  get key(): string {
    return `${this.platform}:${this.id}`;
  }
}
