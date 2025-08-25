export interface LivePlatformInfo {
  /** 平台名称 */
  name: string;
  /** 平台vip信息 */
  vip?: {
    /** 平台vip对应id */
    id: string;
    /** 平台vip名称 */
    name: string;
    /** 平台vip等级名称 */
    level?: string[];
  };
  /** 粉丝vip信息 */
  membership?: {
    /** 粉丝vip对应id */
    id: string;
    /** 粉丝vip名称 */
    name: string;
    /** 粉丝vip等级名称 */
    level?: string[];
  };
  /** 礼物信息 */
  gift?: {
    /** 默认送出礼物行为 */
    action: string;
  };
  /** 统计信息 */
  stats?: Record<string, string>;
  /** 货币信息 */
  valueType?: {
    [key: string | number]: {
      /** 货币名称 */
      name: string;
    };
  };
}
