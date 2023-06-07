export interface PlatformInfo {
  /** 平台名称 */
  name: string
  /** 平台id */
  id: string
  /** 平台vip信息 */
  vip: {
    /** 平台vip对应id */
    id: string,
    /** 平台vip名称 */
    name: string,
    /** 平台vip等级名称 */
    level?: string[],
  }
  /** 粉丝vip信息 */
  membership: {
    /** 粉丝vip对应id */
    id: string,
    /** 粉丝vip名称 */
    name: string,
    /** 粉丝vip等级名称 */
    level?: string,
  }
  /** 礼物信息 */
  gift: {
    /** 货币 */
    currency: Array<{
      /** 货币id */
      id: string,
      /** 货币名称 */
      name: string,
      /** 1货币面值等值value (1面值/1数值) */
      face: number
      /** 1人民币等值value (1.00CNY/1数值) (若为0则为免费货币) */
      cny?: number
    }>
  }
}

export interface RoomConfig {
  
}
