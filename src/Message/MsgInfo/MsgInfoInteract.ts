import UserInfo from "../Info/UserInfo";

/** 互动信息 */
export default interface MsgInfoInteract {
  /** 用户信息 */
  user: UserInfo;
  /** 日期时间戳 */
  timestamp: number;
  /** 信息标签 */
  tag?: string | boolean
}
