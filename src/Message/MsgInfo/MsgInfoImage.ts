import ImageInfo from "../Info/ImageInfo";
import UserInfo from "../Info/UserInfo";

/** 图片聊天信息 */
export default interface MsgInfoImage {
  /** 用户信息 */
  user: UserInfo;
  /** 日期时间戳 */
  timestamp: number;
  /** 弹幕模式 */
  mode?: number | string;
  /** 文字大小 */
  size?: number | string;
  /** 图片信息 */
  image: ImageInfo;
  /** 信息标签 */
  tag?: string | boolean
}
