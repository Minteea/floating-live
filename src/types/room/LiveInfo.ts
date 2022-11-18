/** 直播信息 */
export interface LiveInfo {
  /** 直播标题 */
  title: string
  /** 分区 */
  area?: string[]
  /** 封面url */
  cover?: string
  /** 直播状态(直播/关播/轮播/封禁) */
  status: "live" | "off" | "round" | "banned"
  /** 开始直播时间 */
  start_time: number;
}

/** 直播统计信息 */
export interface LiveStats {
  /** 在线人数 */
  online?: number;
  /** 已观看人数 */
  watched?: number;
  /** 点赞数 */
  like?: number;
  /** 人气值 */
  popularity?: number
}
