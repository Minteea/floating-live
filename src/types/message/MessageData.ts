import { MessageInfo, MsgInfoBlock, MsgInfoGift, MsgInfoImage, MsgInfoInteract, MsgInfoPrivilege, MsgInfoSuperchat, MsgInfoText } from "./MessageInfo"
import { LiveStats } from "../room/LiveInfo";

export interface MessageData {
  /** 平台名称 */
  platform: string;
  /** 房间号 */
  room: number | string;
  /** 信息类型 */
  type: string;
  /** 数据信息 */
  info: MessageInfo
  /** 本地时间戳 */
  local_timestamp?: number
  /** 其他属性 */
  [attr: string]: any
}

export interface MessageText extends MessageData {
  type: "text";
  info: MsgInfoText
}
/** 图片聊天消息 */
export interface MessageImage extends MessageData {
  type: "image";
  info: MsgInfoImage;
}
/** 礼物消息 */
export interface MessageGift extends MessageData {
  type: "gift";
  info: MsgInfoGift;
}
/** 互动消息(进入直播间、点赞、关注、分享、加入粉丝团) */
export interface MessageInteract extends MessageData {
  type: "entry" | "like" | "follow" | "share" | "join";
  info: MsgInfoInteract;
}
/** 粉丝vip开通消息 */
export interface MessagePrivilege extends MessageData {
  type: "privilege";
  info: MsgInfoPrivilege;
}
/** 粉丝vip开通消息 */
export interface MessageSuperchat extends MessageData {
  type: "superchat";
  info: MsgInfoSuperchat;
}
/** 禁言消息 */
export interface MessageBlock extends MessageData {
  type: "block";
  info: MsgInfoBlock;
}

/** 直播开播消息 */
export interface MessageLiveStart extends MessageData {
  type: "live_start";
  info: {
    /** 开播时间 */
    start_time: number
  }
}
/** 直播切断消息 */
export interface MessageLiveCut extends MessageData {
  type: "live_cut";
  info: {
    /** 切断消息 */
    message: string
  }
}
/** 直播数据更新 */
export interface MessageLiveStats extends MessageData {
  type: "live_stats";
  info: LiveStats
}
/** 直播结束 */
export interface MessageLiveEnd extends MessageData {
  type: "live_end";
  info: {
    /** 直播状态 */
    status: "live" | "off" | "round" | "banned"
  }
}

export type MessageType =
  | MessageText
  | MessageImage
  | MessageGift
  | MessageInteract
  | MessagePrivilege
  | MessageSuperchat
  | MessageBlock
  | MessageLiveStart
  | MessageLiveCut
  | MessageLiveStats
  | MessageLiveEnd