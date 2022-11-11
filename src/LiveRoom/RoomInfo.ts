import UserInfo from "../Message/Info/UserInfo"

export default interface RoomInfo {
  /** 平台id */
  platform: string
  /** 房间id */
  id: number
  /** 直播标题 */
  title: string
  /** 分区 */
  area?: string[]
  /** 封面url */
  cover?: string
  /** 主播信息 */
  anchor: UserInfo
  /** 直播间是否可用 */
  available: boolean;
  /** 直播状态(直播/关播/轮播/封禁) */
  status: "live" | "off" | "round" | "banned"
  /** 开始直播时间 */
  start_time: number;
  /** 房间是否打开 */
  opening: boolean;
}