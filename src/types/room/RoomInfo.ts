import { LiveInfo } from "./LiveInfo";
import { UserInfo } from "../message/AttributeInfo";

export default interface RoomInfo {
  /** 平台id */
  platform: string;
  /** 房间id */
  id: number;
  /** 直播信息 */
  live: LiveInfo;
  /** 主播信息 */
  anchor: UserInfo;
  /** 直播间是否可用 */
  available: boolean;
  /** 房间是否打开 */
  opening: boolean;
}
