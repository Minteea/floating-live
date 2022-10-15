import UserInfo from "../Info/UserInfo";
import GiftInfo from "../Info/GiftInfo";

/** 粉丝vip开通信息 */
export default interface MsgInfoPrivilege {
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
