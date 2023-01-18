import { RoomBaseInfo, RoomStatsInfo, RoomStatus } from "../../lib/LiveRoom";
import { UserInfo, GiftInfo, ImageInfo } from "./AttributeInfo";

type MessageBase = {
  /** 平台名称 */
  platform: string;
  /** 房间号 */
  room: number | string;
  /** 信息类型 */
  type: string;
  /** 记录时间 */
  record_time: number
  /** 其他属性 */
  [attr: string]: any
}

export interface MessageInterface extends MessageBase {
  /** 数据信息 */
  info: {[attr: string]: any}
}

export type MessageExt<T extends MessageInterface, E extends {[attr: string]: any} = {[attr: string]: any} > = T & {info: E}

/** 文本聊天消息 */
export type MessageChat = MessageBase & {
  type: "chat";
  info: {
    /** 用户信息 */
    user: UserInfo;
    /** 日期时间戳 */
    timestamp: number;
    /** 文本内容 */
    content: string;
    /** 文字颜色 */
    color?: number | string;
    /** 弹幕模式 */
    mode?: number | string;
    /** 文字大小 */
    size?: number | string;
    /** 图片信息 */
    image?: ImageInfo
    /** 表情信息 */
    emoticon?: {[keyword: string]: ImageInfo}
    /** 标签信息 */
    tag?: string
  }
}

/** 礼物消息 */
export type MessageGift = MessageBase & {
  type: "gift";
  info: {
    /** 用户信息 */
    user: UserInfo;
    /** 日期时间戳 */
    timestamp: number;
    /** 礼物信息 */
    gift: GiftInfo;
  };
}

/** 互动消息(进入直播间、点赞、关注、分享、加入粉丝团) */
export type MessageInteract = MessageBase & {
  type: "entry" | "like" | "follow" | "share" | "join";
  info: {
    /** 用户信息 */
    user: UserInfo;
    /** 日期时间戳 */
    timestamp: number;
    /** 信息标签 */
    tag?: string | boolean
  };
}

/** 粉丝vip开通消息 */
export type MessageMembership = MessageBase & {
  type: "membership";
  info: {
    /** 用户信息 */
    user: UserInfo;
    /** 日期时间戳 */
    timestamp: number;
    /** 礼物信息 */
    gift: GiftInfo;
    /** 开通vip名称 */
    name: string;
    /** 开通vip等级 */
    level?: number;
    /** 持续时间(天数) */
    duration: number;
  };
}

/** 粉丝vip开通消息 */
export type MessageSuperchat = MessageBase & {
  type: "superchat";
  info: {
    /** 留言id */
    id?: string;
    /** 用户信息 */
    user: UserInfo;
    /** 日期时间戳 */
    timestamp: number;
    /** 文本内容 */
    content: string;
    /** 文字颜色 */
    color?: number | string;
    /** 礼物信息 */
    gift: GiftInfo;
    /** (SC)持续时间 */
    duration: number;
  };
}

/** 禁言消息 */
export type MessageBlock = MessageBase & {
  type: "block";
  info: {
    /** 用户信息 */
    user: UserInfo;
    /** 日期时间戳 */
    timestamp?: number;
    /** 操作者 */
    operator: UserInfo | { identity: null | "admin" | "anchor" };
  };
}

/** 直播开播消息 */
export type MessageLiveStart = MessageBase & {
  type: "live_start";
  info: {
    /** 开播时间 */
    timestamp: number
  }
}

/** 直播切断消息 */
export type MessageLiveCut = MessageBase & {
  type: "live_cut";
  info: {
    /** 切断消息 */
    message: string
  }
}

/** 直播数据更新 */
export type MessageLiveStats = MessageBase & {
  type: "live_stats";
  info: RoomStatsInfo
}

/** 直播信息更新 */
export type MessageLiveChange = MessageBase & {
  type: "live_change";
  info: RoomBaseInfo
}

/** 直播结束 */
export type MessageLiveEnd = MessageBase & {
  type: "live_end";
  info: {
    /** 直播状态 */
    status: RoomStatus
  }
}

type AllMessageType = 
  | MessageChat
  | MessageGift
  | MessageInteract
  | MessageMembership
  | MessageSuperchat
  | MessageBlock
  | MessageLiveStart
  | MessageLiveEnd
  | MessageLiveCut
  | MessageLiveChange
  | MessageLiveStats

export type MessageData<T extends AllMessageType["type"] = AllMessageType["type"]> = AllMessageType & {type: T}