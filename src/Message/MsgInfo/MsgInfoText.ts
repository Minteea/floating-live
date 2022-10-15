import UserInfo from "../Info/UserInfo";

/** 文字聊天信息 */
export default interface MsgInfoText {
  /** 用户信息 */
  user: UserInfo;
  /** 日期时间戳 */
  timestamp: number;
  /** 文本内容 */
  text: string;
  /** 文字颜色 */
  color?: number | string;
  /** 弹幕模式 */
  mode?: number | string;
  /** 文字大小 */
  size?: number | string;
  /** 信息标签 */
  tag?: string | boolean
}
