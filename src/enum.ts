/** 直播间状态 */
export enum RoomStatus {
  /** 未开播 */
  off = 0,
  /** 正在直播 */
  live = 1,
  /** 正在轮播 */
  round = 2,
  /** 被封禁 */
  banned = -1,
}

/** 图片大小 */
export enum ImageSize {
  /** 自定义大小 */
  custom = 0,
  /** 小表情(文字行高) */
  small = 1,
  /** 大表情 */
  large = 2,
}

/** 弹幕模式 */
export enum DanmakuMode {
  left = 1,
  bottom = 4,
  top = 5,
  right = 6,
}

/** 管理等级 */
export enum UserAdmin {
  /** 房管 */
  admin = 1,
  /** 主播 */
  anchor = 2,
}
