export default interface GiftInfo {
  /** 礼物名称 */
  name: string
  /** 礼物id */
  id: number | string
  /** 礼物数量 */
  num: number
  /** 总价值 */
  value: number
  /** 平台货币 */
  currency: string
  /** 礼物连击数 */
  combo?: string
  /** 礼物连击id */
  combo_id?: string
  /** 人民币价值 */
  cny?: number
  /** 行为 */
  action?: string
  /** 随机礼物信息 */
  blind_gift?: GiftInfo
}