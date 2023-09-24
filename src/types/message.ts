import { ImageSize, UserType } from "../enum";
import { DanmakuMode, RoomStatus } from "../enum";
import { RoomDetail, RoomStatsInfo } from "./room";

export namespace Message {
  export interface Base {
    /** 平台名称 */
    platform: string;
    /** 房间号 */
    room: number | string;
    /** 信息类型 */
    type: string;
    /** 时间戳 */
    timestamp: number;
    /** 消息id */
    id: string;
    /** 其他属性 */
    [attr: string]: any;
  }
  /** 文本聊天消息 */
  export interface Chat extends Base {
    type: "chat";
    info: {
      /** 用户信息 */
      user: UserInfo;
      /** 文本内容 */
      content: string;
      /** 文字颜色 */
      color?: number | string;
      /** 弹幕模式 */
      mode?: DanmakuMode;
      /** 文字大小 */
      size?: number | string;
      /** 图片信息 */
      image?: ImageInfo;
      /** 表情信息 */
      emoticon?: { [keyword: string]: ImageInfo };
      /** 标签信息 */
      tag?: string;
    };
  }

  /** 礼物消息 */
  export interface Gift extends Base {
    type: "gift";
    info: {
      /** 用户信息 */
      user: UserInfo;
      /** 礼物信息 */
      gift: GiftInfo;
    };
  }

  /** 互动消息(进入直播间、点赞、关注、分享、加入粉丝团) */
  export interface Interact extends Base {
    type: "entry" | "like" | "follow" | "share" | "join";
    info: {
      /** 用户信息 */
      user: UserInfo;
      /** 信息标签 */
      tag?: string | boolean;
    };
  }

  /** 粉丝vip开通消息 */
  export interface Membership extends Base {
    type: "membership";
    info: {
      /** 用户信息 */
      user: UserInfo;
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
  export interface Superchat extends Base {
    type: "superchat";
    info: {
      /** 留言id */
      id: string;
      /** 用户信息 */
      user: UserInfo;
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
  export interface Block extends Base {
    type: "block";
    info: {
      /** 用户信息 */
      user: UserInfo;
      /** 操作者 */
      operator: UserInfo | { type: null | UserType };
    };
  }

  /** 直播开播消息 */
  export interface LiveStart extends Base {
    type: "live_start";
    info: {
      /** 直播id */
      id: string;
    };
  }

  /** 直播结束 */
  export interface LiveEnd extends Base {
    type: "live_end";
    info: {
      /** 直播状态 */
      status: RoomStatus;
    };
  }

  /** 直播切断消息 */
  export interface LiveCut extends Base {
    type: "live_cut";
    info: {
      /** 切断消息 */
      message: string;
    };
  }

  /** 直播数据更新 */
  export interface LiveStats extends Base {
    type: "live_stats";
    info: RoomStatsInfo;
  }

  /** 直播展示信息更新 */
  export interface LiveDetail extends Base {
    type: "live_detail";
    info: RoomDetail;
  }

  export type All =
    | Chat
    | Gift
    | Interact
    | Membership
    | Superchat
    | Block
    | LiveStart
    | LiveEnd
    | LiveCut
    | LiveDetail
    | LiveStats;
}

/** 用户信息 */
export interface UserInfo {
  /** 用户名 */
  name: string;
  /** 用户id */
  id: number;
  /** 头像url */
  avatar?: string;
  /** 粉丝勋章 */
  medal?: MedalInfo | null;
  /** 用户类型 */
  type?: UserType | null;
  /** 粉丝vip等级 */
  membership?: boolean | number;
  /** vip等级 */
  vip?: boolean | number;
  /** 用户等级 */
  level?: number;
}

/** 粉丝牌信息 */
export interface MedalInfo {
  /** 粉丝牌名称 */
  name: string;
  /** 粉丝牌id */
  id: number;
  /** 粉丝牌等级 */
  level?: number;
  /** 粉丝vip等级 */
  membership?: number;
}

/** 图像信息 */
export interface ImageInfo {
  /** 图像名称 */
  name?: string;
  /** 图像id */
  id?: string | number;
  /** 图像url */
  url?: string;
  /** 图像尺寸 */
  size?: ImageSize;
}

/** 礼物信息 */
export interface GiftInfo {
  /** 礼物名称 */
  name: string;
  /** 礼物id */
  id: number | string;
  /** 礼物数量 */
  num: number;
  /** 总价值 */
  value: number;
  /** 平台货币 */
  currency: string;
  /** 礼物连击数 */
  combo?: string;
  /** 礼物连击id */
  comboId?: string;
  /** 人民币价值 */
  cny?: number;
  /** 行为 */
  action?: string;
  /** 随机礼物信息 */
  blindGift?: GiftInfo;
  /** 图片信息 */
  image?: string;
}
