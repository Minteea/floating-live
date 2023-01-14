import { UserInfo } from "../../src/types/message/AttributeInfo";
import { KeepLiveWS } from "bilibili-live-ws";
import axios from "axios";
import { EventEmitter } from "events";
import { LiveRoom, RoomBaseInfo, RoomStatsInfo, RoomStatus } from "../../src/lib/LiveRoom";
import { MessageBlock, MessageChat, MessageGift, MessageInteract, MessageLiveChange, MessageLiveCut, MessageLiveEnd, MessageLiveStart, MessageMembership, MessageSuperchat } from "../../src/types/message/MessageData";

class bilibiliLive extends LiveRoom {
  /** 平台id */
  readonly platform: string = "bilibili"
  /** 直播间号 */
  readonly id: number;
  /** 直播间room_id */
  public roomid: number = 0;
  /** 直播信息 */
  public base: RoomBaseInfo = {
    /** 直播标题 */
    title: "",
    /** 分区 */
    area: [],
    /** 封面url */
    cover: "",
  }
  /** 房间是否可用 */
  public available: boolean = false;
  /** 是否连接上房间 */
  public connected: boolean = false;
  /** 主播信息 */
  public anchor: UserInfo = { name: "", id: 0 }
  /** 直播间弹幕api模块 */
  public client: KeepLiveWS | null = null
  /** 断线重连间隔 */
  public connectInterval: number

  constructor(
    id: number,   // 房间id
    open: boolean = false,  // 生成房间后是否打开
    config?: {
      connectInterval: number   // 断线重连间隔(默认值为100ms)
    }
  ) {
    super();
    this.id = id; // 直播间号
    this.connectInterval = config?.connectInterval || 100
    if (open) {
      this.open()
    } else {
      this.getInfo()
    }
  }
  /** 获取房间信息 */
  public async getInfo() {
    await axios
      .get(
        `https://api.live.bilibili.com/xlive/web-room/v1/index/getInfoByRoom?room_id=${this.id}`
      ) // 获取直播间信息
      .then((res) => {
        let data: any = res.data.data;
        this.roomid = data.room_info.room_id;
        this.status = data.room_info.live_status == 1 ? "live" : "off";
        this.timestamp = this.status == "live" ? data.room_info.live_start_time * 1000 : 0;
        this.base.title = data.room_info.title
        this.base.area = [data.room_info.parent_area_name, data.room_info.area_name]
        this.base.cover = data.room_info.cover
        this.anchor.id = data.room_info.uid;
        this.anchor.name = data.anchor_info.base_info.uname
        this.anchor.avatar = data.anchor_info.base_info.face
        this.available = true
        console.log("[bilibiliLive] 已获取房间信息");
        this.emit("info", this.info)
      })
      .catch((error) => {
        console.error(error);
      });
  }
  /** 开启直播间监听 */
  async open() {
    await this.getInfo()
    // 如果直播间监听已打开或直播间不可用，则返回
    if (this.opening || !this.available) return
    this.opening = true
    this.createWS();
    this.emit("open")
  }
  /** 连接直播服务端 */
  async createWS() {
    // 与Websocket服务器连接
    console.log("[bilibili-live-ws] 开始连接bilibili直播服务器");
    this.client = new KeepLiveWS(this.roomid);
    let client = this.client;

    client.interval = this.connectInterval

    client.on("open", () => {
      console.log("[bilibili-live-ws] 已连接bilibili直播服务器");
      this.emit("connect")
    });
    client.on("close", () => {
      console.log("[bilibili-live-ws] 与bilibili直播服务器的连接已关闭");
      this.emit("disconnect")
    });
    client.on("live", () => {
      console.log("[bilibili-live-ws] 目标房间连接成功");
    });
    client.on("msg", (data: any) => {
      this.emitOrigin(data);
    });
    client.on("DANMU_MSG", this.msg_DANMU_MSG.bind(this));
    //client.on("ENTRY_EFFECT", this.msg_ENTRY_EFFECT.bind(this));
    client.on("INTERACT_WORD", this.msg_INTERACT_WORD.bind(this));
    client.on("SEND_GIFT", this.msg_SEND_GIFT.bind(this));
    client.on("GUARD_BUY", this.msg_GUARD_BUY.bind(this));
    //client.on('COMBO_SEND', this.msg_COMBO_SEND.bind(this))
    client.on("ROOM_BLOCK_MSG", this.msg_ROOM_BLOCK_MSG.bind(this));
    client.on("SUPER_CHAT_MESSAGE", this.msg_SUPER_CHAT_MESSAGE.bind(this));
    client.on("CUT_OFF", this.msg_CUT_OFF.bind(this));
    client.on("PREPARING", this.msg_PREPARING.bind(this));
    client.on("LIVE", this.msg_LIVE.bind(this));
    client.on("ROOM_CHANGE", this.msg_ROOM_CHANGE.bind(this))
  }
  close() {
    if (!this.opening) return
    this.opening = false
    this.client?.close();
    this.emit("close")
  }
  public getDanmakuMode(n: number): string {
    switch (n) {
      case 1:
        return "left";
      case 4:
        return "bottom";
      case 5:
        return "top";
      default:
        return "left";
    }
  }
  /** 获取弹幕消息 */
  public msg_DANMU_MSG(msg: any) {
    let content = msg.info[1];
    let mode = this.getDanmakuMode(msg.info[0][1]);
    let color = msg.info[0][3];
    let uname = msg.info[2][1];
    let uid = msg.info[2][0];
    let timestamp = msg.info[0][4];
    let guard_level = msg.info[7];  // 舰长级别
    let medal = (msg.info[3].length) ? {
        level: msg.info[3][0],
        name: msg.info[3][1],
        // user: msg.info[3][2],
        id: msg.info[3][12],
        membership: msg.info[3][10] || 0,
      } : null;
    let admin: undefined | number = undefined;
    if (msg.info[2][2]) {
      admin = 2;
    } else if (uid == this.anchor.id) {
      admin = 1;
    }
    let danmaku: MessageChat = {
      platform: "bilibili",
      room: this.id,
      type: "chat",
      record_time: new Date().valueOf(),
      info: {
        timestamp: timestamp,
        color: color,
        mode: mode,
        content: content,
        image: msg.info[0][12] ? {
          name: content,
          id: msg.info[0][13].emoticon_unique,
          url: msg.info[0][13].url,
          size: [msg.info[0][13].width, msg.info[0][13].height],
        } : undefined,
        user: {
          name: uname,
          id: uid,
          medal: medal,
          membership: guard_level,
          admin: admin,
        }
      }
    };
    this.emitMsg(danmaku);
  }
  /** 获取互动消息 */
  public msg_INTERACT_WORD(msg: any) {
    let data = msg.data;
    let type: "entry" | "follow" | "share";
    switch (data.msg_type) {
      case 1:
        type = "entry"; // 进入直播间
        break;
      case 2:
        type = "follow"; // 关注直播间
        break;
      case 3:
        type = "share"; // 分享直播间
        break;
      default:
        return
    }
    let interact: MessageInteract = {
      platform: "bilibili",
      room: this.id,
      type: type,
      record_time: new Date().valueOf(),
      info: {
        timestamp: Math.floor(data.trigger_time / 1000000),
        user: {
          name: data.uname,
          id: data.uid,
          medal: (data.fans_medal && data.fans_medal.medal_level) ? {
            level: data.fans_medal.medal_level,
            name: data.fans_medal.medal_name,
            id: data.fans_medal.target_id,
            membership: data.fans_medal.guard_level,
          } : null
        }
      },
    };
    this.emitMsg(interact);
  }
  /** 获取礼物消息 */
  public msg_SEND_GIFT(msg: any) {
    let data = msg.data;
    let gift: MessageGift = {
      platform: "bilibili",
      room: this.id,
      type: "gift",
      record_time: new Date().valueOf(),
      info: {
        timestamp: data.timestamp * 1000, // 接口只能获得秒级时间戳
        user: {
          name: data.uname,
          id: data.uid,
          medal: (data.fans_medal && data.fans_medal.medal_level) ? {
            level: data.fans_medal.medal_level,
            name: data.fans_medal.medal_name,
            id: data.fans_medal.target_id,
            membership: data.fans_medal.guard_level,
          } : null,
          membership: data.guard_level,
          avatar: data.face
        },
        gift: {
          name: data.giftName,
          id: data.giftId,
          num: data.num,
          value: data.total_coin,
          currency: data.coin_type,
          action: data.action,
          combo_id: data.batch_combo_id,
        }
      },
    };
    this.emitMsg(gift);
  }
  /** 获取舰长开通消息 */
  public msg_GUARD_BUY(msg: any) {
    let data = msg.data;
    let gift: MessageMembership = {
      platform: "bilibili",
      room: this.id,
      type: "membership",
      record_time: new Date().valueOf(),
      info: {
        timestamp: data.start_time * 1000,
        user: {
          name: data.username,
          id: data.uid,
          membership: data.guard_level,
        },
        gift: {
          name: data.gift_name,
          id: data.gift_id,
          num: data.num,
          value: data.price,
          currency: "gold",
        },
        name: data.gift_name,
        level: data.guard_level,
        duration: data.num * 30,
      },
    };
    this.emitMsg(gift);
  }
  /** 获取醒目留言消息 */
  public msg_SUPER_CHAT_MESSAGE(msg: any) {
    let data = msg.data;
    let sc: MessageSuperchat = {
      platform: "bilibili",
      room: this.id,
      type: "superchat",
      record_time: new Date().valueOf(),
      info: {
        id: data.id,
        timestamp: data.ts * 1000,
        user: {
          name: data.user_info.uname,
          id: data.uid,
          avatar: data.user_info.face,
          medal: (data.medal_info && data.medal_info.medal_level) ? {
            level: data.medal_info.medal_level,
            name: data.medal_info.medal_name,
            id: data.medal_info.target_id,
            membership: data.medal_info.guard_level,
          } : null,
          membership: data.user_info.guard_level,
        },
        content: data.message, // 文字
        color: data.background_bottom_color, // 颜色
        duration: data.time * 1000, // 持续时间(ms)
        gift: {
          id: data.gift.gift_id,
          name: data.gift.gift_name,
          num: data.gift.num,
          value: data.price * 1000, // 花费
          currency: "gold",
        }
      },
    };
    this.emitMsg(sc);
  }
  msg_ROOM_BLOCK_MSG(msg: any) {
    // 禁言
    let data = msg.data;
    let block: MessageBlock = {
      platform: "bilibili",
      room: this.id,
      type: "block",
      record_time: new Date().valueOf(),
      info: {
        user: {
          id: data.uid,
          name: data.uname
        },
        operator: {
          identity: data.operator == 2 ? "anchor" : "admin"
        }
      },
    };
    this.emitMsg(block);
  }
  msg_LIVE(msg: any) {
    // 直播间开播
    if (msg.live_time) {
      let live: MessageLiveStart = {
        platform: "bilibili",
        room: this.id,
        type: "live_start",
        record_time: new Date().valueOf(),
        info: {
          timestamp: msg.live_time * 1000,
        },
      };
      this.emitMsg(live);
    }
  }
  msg_CUT_OFF(msg: any) {
    // 直播间被切断
    let cut: MessageLiveCut = {
      platform: "bilibili",
      room: this.id,
      type: "live_cut",
      record_time: new Date().valueOf(),
      info: {
        message: msg.msg,
      },
    };
    this.emitMsg(cut);
  }
  msg_PREPARING(msg: any) {
    let off: MessageLiveEnd = {
      platform: "bilibili",
      room: this.id,
      type: "live_end",
      record_time: new Date().valueOf(),
      info: {
        status: msg.round ? "round" : "off"
      }
    }
    this.emitMsg(off)
  }
  msg_ROOM_CHANGE(msg: any) {
    let change: MessageLiveChange = {
      platform: "bilibili",
      room: this.id,
      type: "live_change",
      record_time: new Date().valueOf(),
      info: {
        title: msg.data.title,
        area: [msg.data.parent_area_name, msg.data.area_name]
      }
    }
    this.emitMsg(change)
  }
}

export default bilibiliLive;
