import { FloatingLive, PlatformInfo } from "../..";
import { AuthOptions } from "../../src/types/auth";
import RoomBilibili from "./room";
import {
  checkLoginQRcode,
  generateLoginQRcode,
  getLoginUid,
  parseCookieString,
} from "./utils";

const bilibili = () => {
  return {
    name: "bilibili",
    register: (ctx: FloatingLive) => {
      ctx.room.generator.register(
        "bilibili",
        (id: string | number, open?: boolean, config?: object) => {
          return new RoomBilibili(Number(id), open, config);
        }
      );
      ctx.auth.options.register("bilibili", authConfig);

      ctx.command.register("auth.bilibili", async (auth) => {
        const uid = await getLoginUid(auth);
        ctx.auth.status["bilibili"] = uid;
        ctx.auth.set("bilibili", auth);
        ctx.emit("auth:update", "bilibili", uid);
      });
      ctx.command.register("auth.bilibili.qrcode.get", () => {
        return generateLoginQRcode();
      });
      ctx.command.register("auth.bilibili.qrcode.check", async (key) => {
        const [code, auth] = await checkLoginQRcode(key);
        if (auth) {
          const { SESSDATA, DedeUserID } = parseCookieString(auth as string);
          ctx.auth.status["bilibili"] = DedeUserID;
          ctx.auth.set("bilibili", `SESSDATA=${SESSDATA}`);
          ctx.emit("auth:update", "bilibili", DedeUserID);
        }
        return [code, auth];
      });
    },
  };
};

const authConfig: AuthOptions = {
  auth: {
    type: "cookie",
  },
  qrcode: {
    type: "url",
  },
};

export = bilibili;
