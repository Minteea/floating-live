import { RoomDetail } from './../../src/lib/LiveRoom';
import { MedalInfo, UserInfo } from "../..";
import getAcClient from "acfun-live-danmaku";
import AcClient from "acfun-live-danmaku/client";
import {
  MessageChat,
  MessageGift,
  MessageInteract,
  MessageLiveEnd,
  MessageLiveCut,
  MessageLiveStats,
} from "../..";
import { LiveRoom, RoomStatsInfo } from "../..";
import { RoomStatus, UserAdmin } from "../..";

type ZtLiveUserInfo = {
  userIdentity: {
    managerType?: number;
  };
  badge?: string;
  nickname: string;
  userId: string;
  avatar: [
    {
      url: string;
    }
  ];
};

// 获取当前时间戳，以替代无法从数据中获取时间戳的情况，精度为1s
function getDateTimestamp() {
  return Math.floor(Date.now() / 1000) * 1000;
}

function stringToNumber(num: string) {
  if (num.slice(-1) == "万") {
    return Math.round(parseFloat(num) * 10000);
  } else {
    return parseFloat(num);
  }
}

class acfunLive extends LiveRoom {
  /** 平台id */
  readonly platform: string = "acfun";
  /** 房间id */
  readonly id: number;
  /** 直播展示信息 */
  public detail: RoomDetail = {
    /** 直播标题 */
    title: "",
    /** 分区 */
    area: [],
    /** 封面 */
    cover: "",
  };
  /** 直播数据信息 */
  public stats: RoomStatsInfo = {
    /** 点赞数 */
    like: 0,
    /** 在线观看数 */
    online: 0,
  };
  /** 主播信息 */
  public anchor: UserInfo = { name: "", id: 0 };
  /** 直播间弹幕api模块 */
  public client: AcClient | null = null;
  /** 是否为打开状态 */
  public opening: boolean = false;
  /** 是否连接上服务器 */
  public connected: boolean = false;

  private wsInit: boolean = false;
  /** 直播间是否可用 */
  public get available(): boolean {
    return Boolean(this.client);
  }

  constructor(id: number, open: boolean = false) {
    super();
    this.platform = "acfun";
    this.id = id; // 直播间号
    this.anchor.id = id; // 主播uid
    this.getInfo().then(() => {
      if (open) this.open();
    });
  }
  public async getInfo() {
    if (!this.client) {
      this.client = (await getAcClient(this.id)) || null;
      if (this.client) {
        this.status = RoomStatus.live;
        this.timestamp = this.client.liveStartTime;
        this.detail.title = this.client.caption as unknown as string; // bug
        this.detail.cover = `https://tx2.a.kwimgs.com/bs2/ztlc/cover_${this.client.liveId}_raw.jpg`;
      }
      await fetch(
        `https://live.acfun.cn/rest/pc-direct/user/userInfo?userId=${this.id}`,
        {
          method: "GET",
        }
      )
        .then((response) => response.json())
        .then((res) => {
          let { headUrl, name } = res.profile;
          this.anchor.avatar = headUrl;
          this.anchor.name = name;
          this.emit("info");
        })
        .catch((error) => {
          console.error(error);
        });
    }
    // 暂不能在连接房间后更新信息
  }
  /** 开启直播间监听 */
  async open() {
    if (this.opening || !this.available) return;
    if (!this.wsInit) {
      this.initWS();
    }
    //启动websocket连接
    this.opening = true;
    this.client!.wsStart();
    this.emit("open");
  }
  /** 初始化直播服务端监听 */
  private async initWS() {
    if (!this.client) return;
    let client = this.client;
    client.on("EnterRoomAck", () => {
      console.log("[acfun-live-danmaku] 已连接AcFun直播间");
      this.status = RoomStatus.live;
    });
    client.on("RecentComment", (comments: any) => {
      //当前弹幕列表
    });
    client.on("Comment", (danmaku: any) => {
      //收到的弹幕
      this.msg_Comment(danmaku);
    });
    client.on("Gift", (msg: any) => {
      this.msg_Gift(msg);
    });
    client.on("UserEnterRoom", (msg: any) => {
      this.msg_Interact(msg, "entry");
    });
    client.on("Like", (msg: any) => {
      this.msg_Interact(msg, "like");
    });
    // client.on("UserFollowAuthor", (join: any) => { this.msg_Interact(msg, "follow"); });
    // client.on("JoinClub", (msg: any) => { this.msg_Interact(msg, "join"); });
    client.on("DisplayInfo", (msg: any) => {
      this.msg_DisplayInfo(msg);
    });
    client.on("LiveClosed", (msg: any) => {
      this.msg_LiveClosed();
    });
    client.on("LiveBanned", (msg: any) => {
      this.msg_LiveBanned();
    });
    this.wsInit = true;
  }
  /** 关闭直播间监听 */
  close() {
    if (!this.opening) return;
    this.opening = false;
    this.client?.wsClose();
    this.emit("close");
  }
  destory() {
    this.close();
    this.removeAllListeners();
  }
  /** 根据守护徽章字符串获取粉丝牌信息 */
  public getMedal(badge?: string): MedalInfo | null {
    if (badge) {
      let medalInfo = JSON.parse(badge).medalInfo;
      return {
        name: medalInfo.clubName,
        id: medalInfo.uperId,
        level: medalInfo.level,
      };
    } else {
      return null;
    }
  }
  public getUser(user: ZtLiveUserInfo): UserInfo {
    let identity: UserAdmin | null = null;
    if (user.userIdentity?.managerType == 1) {
      identity = UserAdmin.admin;
    } else if (parseInt(user.userId) == this.anchor.id) {
      identity = UserAdmin.anchor;
    }
    return {
      name: user.nickname,
      id: parseInt(user.userId),
      medal: this.getMedal(user.badge),
      avatar: user.avatar[0].url,
      admin: identity,
    };
  }
  /** 文本信息(Comment) */
  public msg_Comment(data: {
    sendTimeMs: string;
    userInfo: ZtLiveUserInfo;
    content: any;
  }) {
    const userInfo = this.getUser(data.userInfo);
    let m: MessageChat = {
      platform: "acfun",
      room: this.id,
      id: `${userInfo.id}-${data.sendTimeMs}`,
      timestamp: parseInt(data.sendTimeMs),
      type: "chat",
      info: {
        content: data.content,
        user: userInfo,
      },
    };
    this.emitMsg(m);
  }
  /** 礼物信息(Gift) */
  public msg_Gift(data: {
    sendTimeMs: string;
    user: ZtLiveUserInfo;
    giftName: any;
    giftId: string;
    count: number;
    value: string;
  }) {
    const userInfo = this.getUser(data.user);
    let m: MessageGift = {
      platform: "acfun",
      room: this.id,
      type: "gift",
      id: `${userInfo.id}-${data.sendTimeMs}`,
      timestamp: parseInt(data.sendTimeMs),
      info: {
        user: userInfo,
        gift: {
          name: data.giftName, // 礼物名称
          id: parseInt(data.giftId), // 礼物id
          num: data.count, // 礼物数量
          currency: data.giftId == "1" ? "banana" : "coin", // 货币种类
          value: parseInt(data.value), // 总价值
        },
      },
    };
    this.emitMsg(m);
  }
  /** 互动信息 */
  public msg_Interact(
    data: {
      sendTimeMs: string;
      userInfo: ZtLiveUserInfo;
    },
    type: "entry" | "like" | "follow" | "share" | "join"
  ) {
    const userInfo = this.getUser(data.userInfo);
    let m: MessageInteract = {
      platform: "acfun",
      room: this.id,
      type: type,
      id: `${userInfo.id}-${data.sendTimeMs}`,
      timestamp: parseInt(data.sendTimeMs),
      info: {
        user: userInfo,
      },
    };
    this.emitMsg(m);
  }
  public msg_LiveClosed() {
    const timestamp = getDateTimestamp();
    let m: MessageLiveEnd = {
      platform: "acfun",
      room: this.id,
      type: "live_end",
      id: `${timestamp}`,
      timestamp: timestamp,
      info: {
        status: RoomStatus.off,
      },
    };
    this.client = null;
    this.emitMsg(m);
  }
  public msg_LiveBanned() {
    const timestamp = getDateTimestamp();
    let m: MessageLiveCut = {
      platform: "acfun",
      room: this.id,
      type: "live_cut",
      id: `${timestamp}`,
      timestamp: timestamp,
      info: {
        message: "",
      },
    };
    this.client = null;
    this.emitMsg(m);
  }
  msg_DisplayInfo(data: any) {
    const timestamp = getDateTimestamp();
    let m: MessageLiveStats = {
      platform: "acfun",
      room: this.id,
      type: "live_stats",
      id: `${timestamp}`,
      timestamp: timestamp,
      info: {
        like: stringToNumber(data.likeCount),
        online: stringToNumber(data.watchingCount),
      },
    };
    this.emitMsg(m);
  }
}

export default acfunLive;
