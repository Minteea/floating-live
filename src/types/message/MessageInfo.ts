import { UserInfo, ImageInfo, GiftInfo } from "./AttributeInfo";


/** 聊天板信息 */
export interface MessageInfo {
  /** 消息id */
  msg_id?: string;
  /** id */
  id?: string;
  /** 用户信息 */
  user?: UserInfo;
  /** 日期时间戳 */
  timestamp?: number;
  /** 文本内容 */
  text?: string;
  /** 文字颜色 */
  color?: number | string;
  /** 弹幕模式 */
  mode?: number | string;
  /** 文字大小 */
  size?: number | string;
  /** 图片信息 */
  image?: ImageInfo;
  /** 礼物信息 */
  gift?: GiftInfo;
  /** (SC)持续时间 */
  duration?: number;
  /** 其他属性 */
  [attr: string]: any
}

/** 文字聊天信息 */
export interface MsgInfoText {
  /** 用户信息 */
  user: UserInfo;
  /** 日期时间戳 */
  timestamp: number;
  /** 文本内容 */
  text: string;
  /** 文字颜色 */
  color?: number | string;
  /** 弹幕模式 */
  mode?: number | string;
  /** 文字大小 */
  size?: number | string;
  /** 信息标签 */
  tag?: string | boolean
}

/** 图片聊天信息 */
export interface MsgInfoImage {
  /** 用户信息 */
  user: UserInfo;
  /** 日期时间戳 */
  timestamp: number;
  /** 弹幕模式 */
  mode?: number | string;
  /** 文字大小 */
  size?: number | string;
  /** 图片信息 */
  image: ImageInfo;
  /** 信息标签 */
  tag?: string | boolean
}

/** 礼物信息 */
export interface MsgInfoGift {
  /** 用户信息 */
  user: UserInfo;
  /** 日期时间戳 */
  timestamp: number;
  /** 礼物信息 */
  gift: GiftInfo;
}

/** 互动信息 */
export interface MsgInfoInteract {
  /** 用户信息 */
  user: UserInfo;
  /** 日期时间戳 */
  timestamp: number;
  /** 信息标签 */
  tag?: string | boolean
}

/** 粉丝付费会员开通信息 */
export interface MsgInfoPrivilege {
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
  /** 续费类型(0为非续费开通, 1为续费, 2为自动续费) */
  renew?: 0 | 1 | 2;
}

/** 付费留言信息 */
export interface MsgInfoSuperchat {
  /** 留言id */
  id?: string;
  /** 用户信息 */
  user: UserInfo;
  /** 日期时间戳 */
  timestamp: number;
  /** 文本内容 */
  text: string;
  /** 文字颜色 */
  color?: number | string;
  /** 礼物信息 */
  gift: GiftInfo;
  /** (SC)持续时间 */
  duration: number;
}

/** 禁言信息 */
export interface MsgInfoBlock {
  /** 用户信息 */
  user: UserInfo;
  /** 日期时间戳 */
  timestamp?: number;
  /** 操作者 */
  operator: UserInfo | { admin: number };
}
