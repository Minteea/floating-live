// 凭证获取选项
export interface AuthOptions {
  /** 直接输入凭证 */
  auth: {
    /** 凭证类型 */
    type: string;
  };
  /** 二维码登录 */
  qrcode?: {
    /** 二维码类型 */
    type: "url" | "base64";
  };
  /** 验证码登录 */
  verify?: {
    /** 验证码发送等待间隔(秒) */
    wait: number;
    /** 第三方验证接口 */
    captcha?: string;
  };
}
