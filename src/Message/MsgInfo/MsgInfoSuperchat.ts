import UserInfo from "../Info/UserInfo";
import GiftInfo from "../Info/GiftInfo";

/** 付费留言信息 */
export default interface MsgInfoSuperchat {
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
