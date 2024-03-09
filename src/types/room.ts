import { ConnectStatus, RoomStatus } from "../enums";
import { UserInfo } from "./message";

/** 房间配置 */
export interface RoomConfig {
  /** 添加后是否打开房间 */
  open?: boolean;
  /** 口令 */
  tokens?: Record<string, number>;
  /** 凭据 */
  credentials?: string;
}

/** 房间信息 */
export interface RoomInfo {
  /** 平台id */
  platform: string;
  /** 房间id */
  id: number | string;
  /** 房间key */
  key: string;
  /** 基本信息 */
  detail: RoomDetail;
  /** 统计信息 */
  stats?: RoomStatsInfo;
  /** 主播信息 */
  anchor: UserInfo;
  /** 时间戳 */
  timestamp: number;
  /** 当前直播id */
  liveId?: string;
  /** 直播状态 */
  status: RoomStatus;
  /** 直播间是否可用 */
  available: boolean;
  /** 房间监听是否打开 */
  opened: boolean;
  /** 房间连接状态 */
  connection: ConnectStatus;
}

/** 房间展示信息 */
export interface RoomDetail {
  /** 直播标题 */
  title?: string;
  /** 分区 */
  area?: string[];
  /** 封面 */
  cover?: string;
}

/** 房间统计数据信息 */
export interface RoomStatsInfo {
  /** 点赞数 */
  like?: number;
  /** 观看数 */
  view?: number;
  /** 在线人数 */
  online?: number;
  /** 人气值 */
  popularity?: number;
}

export interface PlatformInfo {
  /** 平台名称 */
  name: string;
  /** 平台vip信息 */
  vip?: {
    /** 平台vip对应id */
    id: string;
    /** 平台vip名称 */
    name: string;
    /** 平台vip等级名称 */
    level?: string[];
  };
  /** 粉丝vip信息 */
  membership?: {
    /** 粉丝vip对应id */
    id: string;
    /** 粉丝vip名称 */
    name: string;
    /** 粉丝vip等级名称 */
    level?: string[];
  };
  /** 礼物信息 */
  gift?: {
    /** 默认送出礼物行为 */
    action: string;
  };
  /** 统计信息 */
  stats?: Record<string, string>;
  /** 货币信息 */
  currency?: Record<
    string,
    {
      /** 货币名称 */
      name: string;
      /** 1货币面值等值value (1面值/1数值) */
      ratio: number;
      /** 1单位消费金额等值value (1.00CNY/1数值) (若为0则为免费货币) */
      money?: number;
    }
  >;
}
