import UserInfo from "../Info/UserInfo";

/** 禁言信息 */
export default interface MsgInfoBlock {
  /** 用户信息 */
  user: UserInfo;
  /** 日期时间戳 */
  timestamp?: number;
  /** 操作者 */
  operator: UserInfo | { admin: number };
}
