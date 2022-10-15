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
  /** 是否持续保持连接 */
  keep_connection: boolean;
  /** 是否正在直播 */
  living: boolean
  /** 开始直播时间 */
  start_time: number;
  /** 直播间是否被封禁 */
  banned?: boolean
}