import RoomInfo from "../LiveRoom/RoomInfo";
import MedalInfo from "../Message/Info/MedalInfo";
import UserInfo from "../Message/Info/UserInfo";
import { MessageInteract, MessageText, MessageGift } from "../Message/MessageInterface";
import LiveRoom from "../liveroom/LiveRoom";
// @ts-ignore
import AcClient from "ac-danmu";
import { EventEmitter } from "events";
import getRoomInfo from "../LiveRoom/getRoomInfo";

class acfunLive extends EventEmitter implements LiveRoom {
  /** 平台id */
  readonly platform: string = "acfun"
  /** 房间id */
  readonly id: number
  /** 直播标题 */
  public title: string = ""
  /** 分区 */
  public area: string[] = []
  /** 封面url */
  public cover: string = ""
  /** 主播信息 */
  public anchor: UserInfo = { name: "", id: 0 }
  /** 是否持续保持连接 */
  readonly keep_connection: boolean = false
  /** 直播状态 */
  public status: RoomInfo["status"] = "off"
  /** 开始直播时间 */
  public start_time: number = 0
  /** 直播间弹幕api模块 */
  public client: any = null
  /** 是否为持续监听状态 */
  public opening: boolean = false

  constructor(id: number, open: boolean = false) {
    super();
    this.platform = "acfun"
    this.id = id; // 直播间号
    this.anchor.id = id; // 主播uid
    this.getInfo().then(() => {
      if (open) this.open()
    })
    console.log("连接直播间");
  }
  public async getInfo() {

  }
  get roomInfo(): RoomInfo {
    return getRoomInfo(this)
  }
  /** 开启直播间监听 */
  async open() {
    if (this.opening) return
    this.opening = true
    this.createWS();
    this.emit("open")
  }
  /** 连接直播服务端 */
  async createWS() {
    this.client = await AcClient(this.id);
    let client = this.client;
    //启动websocket连接
    client.wsStart();
    client.on("enter", () => {
      console.log("acfunLive: 已连接AcFun直播间");
      this.status = "live"
    });
    client.on("recent-comment", (comments: any) => {
      //当前弹幕列表
    });
    client.on("danmaku", (danmaku: any) => {
      //收到的弹幕
      this.msg_danmaku(danmaku);
    });
    client.on("gift", (gift: any) => {
      //收到的礼物
      this.msg_gift(gift);
    });
    client.on("user-enter", (entry: any) => {
      //用户进入直播间
      this.msg_interact(entry, "entry");
    });
    client.on("like", (like: any) => {
      //用户点赞
      this.msg_interact(like, "like");
    });
    client.on("join-club", (join: any) => {
      //用户加入守护团
      this.msg_interact(join, "join");
    });
    client.on("live-info", (info: any) => {
      //直播间数据状态
      this.msg_live_info(info);
    });
    client.on("liveclose", (end: any) => {
      console.log("acfunLive: 直播已结束或中断");
      this.status = "off"
    });
    this.initOrigin();
  }
  close() {
    // 临时替代方案，解除监听并丢弃client实例
    this.client.removeAllListeners()
    this.client = null
    this.emit("close")
  }
  destory() {
    this.close()
    this.removeAllListeners()
  };
  /** 根据守护徽章字符串获取粉丝牌信息 */
  public getMedal(badge: string): MedalInfo | null {
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
  /** 文本信息(danmaku) */
  public msg_danmaku(data: {
    sendTimeMs: string;
    userInfo: {
      userIdentity: any;
      badge: string;
      nickname: any;
      userId: string;
    };
    content: any;
  }) {
    let danmaku: MessageText = {
      platform: "acfun",
      room: this.id,
      local_timestamp: new Date().valueOf(),
      type: "text",
      info: {
        text: data.content,
        user: {
          name: data.userInfo.nickname,
          id: parseInt(data.userInfo.userId),
          medal: this.getMedal(data.userInfo.badge),
          admin: data.userInfo.userIdentity,
        },
        timestamp: parseInt(data.sendTimeMs),
      },
    };
    this.emitMsg(danmaku);
  }
  /** 礼物信息(gift) */
  public msg_gift(data: {
    sendTimeMs: string;
    userInfo: {
      userIdentity: any;
      badge: string;
      nickname: any;
      userId: string;
    };
    giftName: any;
    giftId: string;
    count: any;
    value: string;
  }) {
    let gift: MessageGift = {
      platform: "acfun",
      room: this.id,
      type: "gift",
      local_timestamp: new Date().valueOf(),
      info: {
        user: {
          name: data.userInfo.nickname,
          id: parseInt(data.userInfo.userId),
          medal: this.getMedal(data.userInfo.badge),
          admin: data.userInfo.userIdentity,
        },
        gift: {
          name: data.giftName, // 礼物名称
          id: parseInt(data.giftId), // 礼物id
          num: data.count, // 礼物数量
          currency: "coin", // 货币种类
          value: parseInt(data.value), // 总价值
        },
        timestamp: parseInt(data.sendTimeMs),
      },
    };
    this.emitMsg(gift);
  }
  /** 互动信息 */
  public msg_interact(
    data: {
      sendTimeMs: string;
      userInfo: {
        userIdentity: any;
        badge: string;
        nickname: any;
        userId: string;
      };
    },
    type: "entry" | "like" | "follow" | "share" | "join"
  ) {
    let like: MessageInteract = {
      platform: "acfun",
      room: this.id,
      type: type,
      local_timestamp: new Date().valueOf(),
      info: {
        user: {
          name: data.userInfo.nickname,
          id: parseInt(data.userInfo.userId),
          medal: this.getMedal(data.userInfo.badge),
          admin: data.userInfo.userIdentity,
        },
        timestamp: parseInt(data.sendTimeMs),
      },
    };
    this.emitMsg(like);
  }
  msg_live_info(data: any) {
    // this.toData(msg)
  }
  emitMsg(data: any) {
    // 一般消息
    this.emit("msg", data);
  }
  emitOrigin(data: any) {
    // 源消息
    this.emit("origin", data);
  }
  initOrigin() {
    this.client.on("recent-comment", (comments: any) => {
      //当前弹幕列表
      this.emitOrigin(comments);
    });
    this.client.on("danmaku", (danmaku: any) => {
      //收到的弹幕
      this.emitOrigin({ type: "danmaku", data: danmaku });
    });
    this.client.on("like", (like: any) => {
      //收到的点赞
      this.emitOrigin({ type: "like", data: like });
    });
    this.client.on("gift", (gift: any) => {
      //收到的礼物
      this.emitOrigin({ type: "gift", data: gift });
    });
    this.client.on("user-enter", (entry: any) => {
      //用户进入直播间
      this.emitOrigin({ type: "user-enter", data: entry });
    });
    this.client.on("join-club", (join: any) => {
      //用户加入守护团
      this.emitOrigin({ type: "join-club", data: join });
    });
    this.client.on("live-info", (info: any) => {
      //直播间数据状态
      this.emitOrigin({ type: "live-info", data: info });
    });
  }
}

export default acfunLive;
