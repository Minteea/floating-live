import UserInfo from "../Info/UserInfo";
import GiftInfo from "../Info/GiftInfo";

/** 礼物信息 */
export default interface MsgInfoGift {
  /** 用户信息 */
  user: UserInfo;
  /** 日期时间戳 */
  timestamp: number;
  /** 礼物信息 */
  gift: GiftInfo;
}
