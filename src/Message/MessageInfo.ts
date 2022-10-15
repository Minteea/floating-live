import ImageInfo from "./Info/ImageInfo";
import UserInfo from "./Info/UserInfo";
import GiftInfo from "./Info/GiftInfo";

/** 聊天板信息 */
export default interface MessageInfo {
  /** 消息id */
  msg_id?: string;
  /** id */
  id?: string;
  /** 用户信息 */
  user?: UserInfo;
  /** 日期时间戳 */
  timestamp?: number;
  /** 文本内容 */
  text?: string;
  /** 文字颜色 */
  color?: number | string;
  /** 弹幕模式 */
  mode?: number | string;
  /** 文字大小 */
  size?: number | string;
  /** 图片信息 */
  image?: ImageInfo;
  /** 礼物信息 */
  gift?: GiftInfo;
  /** (SC)持续时间 */
  duration?: number;
}