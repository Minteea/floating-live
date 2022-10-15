import MedalInfo from "./MedalInfo"

/** 用户信息 */
export default interface UserInfo {
  /** 用户名 */
  name: string;
  /** 用户id */
  id: number;
  /** 头像url */
  avatar?: string;
  /** 粉丝勋章 */
  medal?: MedalInfo | null;
  /** 房管等级(1为主播, 2为管理员) */
  admin?: number;
  /** 粉丝vip等级 */
  privilege?: boolean | number;
  /** vip等级 */
  vip?: boolean | number;
  /** 用户等级 */
  level?: number;
}