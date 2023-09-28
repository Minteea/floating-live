import { FloatingLive } from "../..";
import RoomBilibili from "./room";

export = () => {
  return {
    name: "bilibili",
    register: (ctx: FloatingLive) => {
      ctx.rooms.generator.register(
        "bilibili",
        (id: string | number, open?: boolean, config?: object) => {
          return new RoomBilibili(Number(id), open, config);
        }
      );
      ctx.auth.options.register("bilibili", authConfig);
    },
  };
};

const authConfig = {
  info: "由于b站弹幕接口限制，在未登录账号的情况下，返回的弹幕用户名会变为星号且无法获取到uid。\n详见(github:simon300000/bilibili-live-ws#397)[https://github.com/simon300000/bilibili-live-ws/issues/397]",
  auth: {
    placeholder: "此处粘贴cookie",
    info: "请在登录后的b站页面中获取cookie并粘贴在输入框内，至少包含SESSDATA字段。",
  },
  qrcode: {
    //  generate: () => {},
  },
  // verify: { name: "key", type: "string" },
};

interface LoginEvents {
  /** 凭证状态更新 */
  "login:auth_status": (status: boolean) => void;
  /** 二维码状态更新 */
  "login:qrcode_status": (status: boolean) => void;
}
interface LoginCommands {
  /** 凭证登录 */
  "login:auth": () => void;
  /** 二维码登录 */
  "login:qrcode": () => void;
  /** 账号密码登录 */
  "login:password": () => void;
  /** 验证码登录 */
  "login:code": () => void;
}
