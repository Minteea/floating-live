import {
  DanmakuMode,
  UserInfo,
  ImageInfo,
  GiftInfo,
  UserType,
} from "./messageInfo";
import { LiveRoomStatus, LiveRoomStatsInfo, LiveRoomDetailInfo } from "./room";

export namespace LiveMessage {
  export interface Base {
    /** 平台名称 */
    platform: string;
    /** 房间号 */
    roomId: number | string;
    /** 用户id */
    userId: number | string;
    /** 信息类型 */
    type: string;
    /** 时间戳 */
    timestamp: number;
    /** 消息id */
    id: string;
    /** 其他属性 */
    [attr: string]: any;
  }

  /** 聊天消息 */
  export interface Comment extends Base {
    type: "comment";
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
      /** 持续时间(ms) */
      duration: number;
    };
  }

  /** 粉丝vip开通消息 */
  export interface Superchat extends Base {
    type: "superchat";
    info: {
      /** 留言id */
      id: string | number;
      /** 用户信息 */
      user: UserInfo;
      /** 文本内容 */
      content: string;
      /** 文字颜色 */
      color?: number | string;
      /** 礼物信息 */
      gift: GiftInfo;
      /** (SC)持续时间(ms) */
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
      operator?: UserInfo | { type: UserType };
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
      status: LiveRoomStatus;
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
    info: LiveRoomStatsInfo;
  }

  /** 直播展示信息更新 */
  export interface LiveDetail extends Base {
    type: "live_detail";
    info: LiveRoomDetailInfo;
  }

  /** 主播抽奖 */
  export interface Lottery extends Base {
    type: "lottery";
    info: {
      title: string;
      role: "user" | "anchor";
      user?: UserInfo;
      gift?: GiftInfo;
      id: string | number;
      award?: GiftInfo | GiftInfo[];
      value?: number;
      valueType?: string | number;
      price?: number;
      currency?: string;
    };
  }

  /** 主播抽奖结果 */
  export interface LotteryResult extends Base {
    type: "lottery_result";
    info: {
      title: string;
      role: "user" | "anchor";
      id: string | number;
      result: { user: UserInfo; award: GiftInfo | GiftInfo[] }[];
    };
  }

  /** 发送红包 */
  export interface Redpacket extends Base {
    type: "redpacket";
    info: {
      id: string | number;
      gifts?: GiftInfo[];
      value?: number;
      currency?: string | number;
    };
  }

  /** 红包抽奖结果 */
  export interface RedpacketResult extends Base {
    type: "redpacket_result";
    info: {
      id: string | number;
      result: {
        user: UserInfo;
        gift?: GiftInfo;
        value?: number;
        currency?: string | number;
      }[];
    };
  }

  export type All =
    | Comment
    | Gift
    | Interact
    | Membership
    | Superchat
    | Block
    | LiveStart
    | LiveEnd
    | LiveCut
    | LiveDetail
    | LiveStats
    | Lottery
    | LotteryResult;
}
