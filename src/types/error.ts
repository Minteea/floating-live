export interface ErrorOptions {
  /** 错误消息 */
  message?: string;
  /** 错误原因 */
  reason?: string;
  /** 错误id */
  id?: string;
  /** 错误名称 */
  [key: string]: any;
}
