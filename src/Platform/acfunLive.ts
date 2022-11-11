import RoomInfo from "../LiveRoom/RoomInfo";
import MedalInfo from "../Message/Info/MedalInfo";
import UserInfo from "../Message/Info/UserInfo";
import { MessageInteract, MessageText, MessageGift, MessageLiveEnd, MessageLiveCut } from "../Message/MessageInterface";
import LiveRoom from "../liveroom/LiveRoom";
import getAcClient from "acfun-live-danmaku";
import AcClient from "acfun-live-danmaku/client";
import { EventEmitter } from "events";
import getRoomInfo from "../LiveRoom/getRoomInfo";
import axios from "axios";

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
  /** 直播状态 */
  public status: RoomInfo["status"] = "off"
  /** 开始直播时间 */
  public start_time: number = 0
  /** 直播间弹幕api模块 */
  public client: AcClient | null = null
  /** 是否为持续监听状态 */
  public opening: boolean = false

  private wsInit: boolean = false
  /** 直播间是否可用 */
  public get available(): boolean {
    return Boolean(this.client)
  };

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
    if (!this.client) {
      this.client = await getAcClient(this.id) || null
      if (this.client) {
        this.status = "live"
        this.start_time = this.client.liveStartTime
        this.title = this.client.caption as unknown as string // bug
        this.cover = `https://tx2.a.kwimgs.com/bs2/ztlc/cover_${this.client.liveId}_raw.jpg`
      }
      await axios
        .get(
          `https://live.acfun.cn/rest/pc-direct/user/userInfo?userId=${this.id}`
        )
        .then((res) => {
          let profile: any = res.data.profile;
          this.anchor.avatar = profile.headUrl
          this.anchor.name = profile.name
        })
        .catch((error) => {
          console.error(error);
        });
      this.emit("update", this.roomInfo)
    }
    // 暂不能在连接房间后更新信息
  }
  get roomInfo(): RoomInfo {
    return getRoomInfo(this)
  }
  /** 开启直播间监听 */
  async open() {
    if (this.opening || !this.available) return
    if (!this.wsInit) {
      this.initWS()
    }
    //启动websocket连接
    this.opening = true
    this.client!.wsStart();
    this.emit("open")
  }
  /** 初始化直播服务端监听 */
  private async initWS() {
    if (!this.client) return
    let client = this.client;
    client.on("EnterRoomAck", () => {
      console.log("[acfun-live-danmaku] 已连接AcFun直播间");
      this.status = "live"
    });
    client.on("RecentComment", (comments: any) => {
      //当前弹幕列表
    });
    client.on("Comment", (danmaku: any) => {
      //收到的弹幕
      this.msg_Comment(danmaku);
    });
    client.on("Gift", (gift: any) => { this.msg_Gift(gift); });
    client.on("UserEnterRoom", (entry: any) => { this.msg_Interact(entry, "entry"); });
    client.on("Like", (like: any) => { this.msg_Interact(like, "like"); });
    client.on("JoinClub", (join: any) => { this.msg_Interact(join, "join"); });
    client.on("DisplayInfo", (info: any) => { this.msg_DisplayInfo(info); });
    client.on("LiveClosed", (end: any) => { this.msg_LiveClosed() });
    client.on("LiveBanned", (end: any) => { this.msg_LiveBanned() });
    this.wsInit = true
  }
  close() {
    if (!this.opening) return
    this.opening = false
    this.client?.wsClose();
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
  /** 文本信息(Comment) */
  public msg_Comment(data: {
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
        },
        timestamp: parseInt(data.sendTimeMs),
      },
    };
    this.emitMsg(danmaku);
  }
  /** 礼物信息(Gift) */
  public msg_Gift(data: {
    sendTimeMs: string;
    user: {
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
          name: data.user.nickname,
          id: parseInt(data.user.userId),
          medal: this.getMedal(data.user.badge),
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
  public msg_Interact(
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
        },
        timestamp: parseInt(data.sendTimeMs),
      },
    };
    this.emitMsg(like);
  }
  public msg_LiveClosed() {
    let off: MessageLiveEnd = {
      platform: "acfun",
      room: this.id,
      type: "live_end",
      local_timestamp: new Date().valueOf(),
      info: {
        status: "off"
      }
    }
    this.status = "off"
    this.client = null
    this.emitMsg(off)
  }
  public msg_LiveBanned() {
    let cut: MessageLiveCut = {
      platform: "acfun",
      room: this.id,
      type: "live_cut",
      local_timestamp: new Date().valueOf(),
      info: {
        message: ""
      }
    }
    this.status = "off"
    this.client = null
    this.emitMsg(cut)
  }
  msg_DisplayInfo(data: any) {
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
}

export default acfunLive;
