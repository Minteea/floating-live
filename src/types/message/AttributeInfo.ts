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
  /** 身份 */
  identity?: "anchor" | "admin" | null;
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
  name: string
  /** 粉丝牌id */
  id: number
  /** 粉丝牌等级 */
  level?: number
  /** 粉丝vip等级 */
  membership?: number
}

/** 图像信息 */
export interface ImageInfo {
  /** 图像名称 */
  name?: string;
  /** 图像id */
  id?: string | number;
  /** 图像url */
  url?: string;
  /** 图像高度 */
  height?: number
}

/** 礼物信息 */
export interface GiftInfo {
  /** 礼物名称 */
  name: string
  /** 礼物id */
  id: number | string
  /** 礼物数量 */
  num: number
  /** 总价值 */
  value: number
  /** 平台货币 */
  currency: string
  /** 礼物连击数 */
  combo?: string
  /** 礼物连击id */
  combo_id?: string
  /** 人民币价值 */
  cny?: number
  /** 行为 */
  action?: string
  /** 随机礼物信息 */
  blind_gift?: GiftInfo
  /** 图片信息 */
  image?: string
}
