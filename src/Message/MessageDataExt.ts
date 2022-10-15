interface MessageDataExt {
  /** 平台名称 */
  platform: string;
  /** 房间号 */
  room: number | string;
  /** 信息类型 */
  type: string;
  /** 数据信息 */
  info: any
  /** 本地时间戳 */
  local_timestamp?: number
  /** 屏蔽信息 */
  block?: any
  /** 指令信息 */
  command?: any
}

export default MessageDataExt