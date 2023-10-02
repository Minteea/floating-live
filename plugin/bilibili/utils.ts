import QRCode from "qrcode";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36 Edg/117.0.2045.36";

/** API-当前登录用户信息 */
const UID_INIT_URL = "https://api.bilibili.com/x/web-interface/nav";
/** API-获取BUVID */
const BUVID_INIT_URL = "https://data.bilibili.com/v/";

const ROOM_INIT_URL =
  "https://api.live.bilibili.com/xlive/web-room/v1/index/getInfoByRoom";

const DANMAKU_SERVER_CONF_URL =
  "https://api.live.bilibili.com/xlive/web-room/v1/index/getDanmuInfo";

export function parseCookieString(str: string) {
  const cookie: Record<string, string> = {};
  str.split(";").forEach((item) => {
    if (!item) {
      return;
    }
    const arr = item.split("=");
    const key = arr[0]?.trim();
    const val = arr[1]?.trim();
    cookie[key] = val;
  });
  return cookie;
}

/** 获取登录用户的uid */
export async function getLoginUid(cookie: string = "") {
  // cookie若缺少SESSDATA，一定属于未登录状态，uid返回0
  if (!parseCookieString(cookie)["SESSDATA"]) return 0;
  const res = await fetch(UID_INIT_URL, {
    headers: {
      Cookie: cookie,
      "User-Agent": USER_AGENT,
    },
  }).then((res) => res.json());
  if (res.code == 0) {
    return res.data.mid;
  } else {
    // code = -101 => 账号未登录
    return 0;
  }
}

/** 获取buvid */
export async function getBuvid(cookie: string = "") {
  const res = await fetch(BUVID_INIT_URL, {
    headers: {
      Cookie: cookie,
      "User-Agent": USER_AGENT,
    },
  });
  const resCookie = res.headers.get("set-cookie");
  if (!resCookie) return;
  return parseCookieString(resCookie)["buvid2"];
}

/** 获取直播间弹幕token */
export async function getKey(roomId: number, cookie: string = "") {
  const res = await fetch(`${DANMAKU_SERVER_CONF_URL}?id=${roomId}`, {
    headers: {
      Cookie: cookie,
      "User-Agent": USER_AGENT,
    },
  }).then((res) => res.json());
  return res.data.token;
}

/** 生成登录二维码 */
export async function generateLoginQRcode() {
  const res = await fetch(
    "https://passport.bilibili.com/x/passport-login/web/qrcode/generate",
    {
      headers: {
        "User-Agent": USER_AGENT,
      },
    }
  ).then((res) => res.json());
  return {
    url: res.data.url,
    key: res.data.qrcode_key,
  };
}

/** 在终端打印登录二维码 */
export function printQRcode(url: string) {
  QRCode.toString(url, { type: "terminal" }, function (err, qr) {
    console.log(qr);
  });
}

/** 检测登录二维码 */
export async function checkLoginQRcode(key: string) {
  const res = await fetch(
    `https://passport.bilibili.com/x/passport-login/web/qrcode/poll?qrcode_key=${key}`,
    {
      headers: {
        "User-Agent": USER_AGENT,
      },
    }
  );
  const { code, message } = (await res.json()).data;
  if (code == 86101) {
    // 未扫码
    return [1];
  } else if (code == 86090) {
    // 等待确认
    return [2];
  } else if (code == 0) {
    // 登录成功
    const cookie = res.headers.get("set-cookie");
    return [0, cookie];
  } else if (code == 86038) {
    // 二维码失效
    return [-1];
  } else {
    // 其他错误
    console.log(`${code} ${message}`);
    throw message;
  }
}
