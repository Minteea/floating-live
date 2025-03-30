import { EnumValue } from "../utils/types";

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
  type?: UserType;
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
  currency?: string | number;
  /** 礼物连击数 */
  combo?: string;
  /** 礼物连击id */
  comboId?: string;
  /** 人民币价值 */
  money?: number;
  /** 行为 */
  action?: string;
  /** 随机礼物信息 */
  blindGift?: GiftInfo;
  /** 图片信息 */
  image?: string;
  /** 单位 */
  unit?: string;
}

export const ImageSize = {
  /** 自定义大小 */
  custom: 0,
  /** 小表情(文字行高) */
  small: 1,
  /** 大表情 */
  large: 2,
} as const;
export type ImageSize = EnumValue<typeof ImageSize>;

/** 弹幕模式 */
export const DanmakuMode = {
  left: 1,
  bottom: 4,
  top: 5,
  right: 6,
} as const;
export type DanmakuMode = EnumValue<typeof DanmakuMode>;

/** 用户类型 */
export const UserType = {
  /** 普通观众 */
  normal: 0,
  /** 房管 */
  admin: 1,
  /** 主播 */
  anchor: 2,
} as const;
export type UserType = EnumValue<typeof UserType>;
