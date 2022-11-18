import RoomInfo from "../../src/types/room/RoomInfo";
import { UserInfo } from "../../src/types/message/AttributeInfo";
import { KeepLiveWS } from "bilibili-live-ws";
import axios from "axios";
import { EventEmitter } from "events";
import LiveRoom from "../../src/types/room/LiveRoom";
import getRoomInfo from "../../src/utils/getRoomInfo";
import { MessageText, MessageImage, MessageInteract, MessageGift, MessagePrivilege, MessageSuperchat, MessageBlock } from "../../src/types/message/MessageData";
import { LiveInfo } from "../../src/types/room/LiveInfo";

class bilibiliLive extends EventEmitter implements LiveRoom {
  /** 平台id */
  readonly platform: string = "bilibili"
  /** 直播间号 */
  readonly id: number;
  /** 直播间room_id */
  public roomid: number = 0;
  /** 直播信息 */
  public live: LiveInfo = {
    /** 直播标题 */
    title: "",
    /** 分区 */
    area: [],
    /** 封面url */
    cover: "",
    /** 直播状态 */
    status: "off",
    /** 开始直播时间 */
    start_time: 0
  }
  public cover: string = ""
  /** 主播信息 */
  public anchor: UserInfo = { name: "", id: 0 }
  /** 直播间是否可用 */
  public available: boolean = false;
  /** 直播间弹幕api模块 */
  public client: KeepLiveWS | null = null
  /** 是否为持续监听状态 */
  public opening: boolean = false
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
    this.getInfo().then(() => {
      if (open) this.open()
    })
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
        this.live.status = data.room_info.live_status == 1 ? "live" : "off";
        this.live.start_time = this.live.status == "live" ? data.room_info.live_start_time * 1000 : 0;
        this.live.title = data.room_info.title
        this.anchor.id = data.room_info.uid;
        this.anchor.name = data.anchor_info.base_info.uname
        this.anchor.avatar = data.anchor_info.base_info.face
        this.live.area = [data.room_info.parent_area_name, data.room_info.area_name]
        this.cover = data.room_info.cover
        this.available = true
      })
      .catch((error) => {
        console.error(error);
      });
    console.log("[bilibiliLive] 已获取房间信息");
    this.emit("info")
  }
  /** 开启直播间监听 */
  async open() {
    if (this.opening || !this.available) return
    if (!this.roomid) {
      console.log("[bilibili-live-ws] 未获取直播间room_id属性")
      return
    }
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
  }
  close() {
    if (!this.opening) return
    this.opening = false
    this.client?.close();
    this.emit("close")
  }
  destory() {
    this.close()
    this.removeAllListeners()
  }
  emitMsg(data: any) {
    // 一般消息
    this.emit("msg", data);
  }
  emitOrigin(data: any) {
    // 源消息
    this.emit("origin", data);
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
    let text = msg.info[1];
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
        privilege: msg.info[3][10] || 0,
      } : null;
    let admin: undefined | number = undefined;
    if (msg.info[2][2]) {
      admin = 2;
    } else if (uid == this.anchor.id) {
      admin = 1;
    }
    let danmaku: MessageText | MessageImage
    if (msg.info[0][12]) {
      danmaku = {
        platform: "bilibili",
        room: this.id,
        type: "image",
        local_timestamp: new Date().valueOf(),
        info: {
          timestamp: timestamp,
          mode: mode,
          image:{
            name: text,
            id: msg.info[0][13].emoticon_unique,
            url: msg.info[0][13].url,
            size: [msg.info[0][13].width, msg.info[0][13].height],
          },
          user: {
            name: uname,
            id: uid,
            medal: medal,
            privilege: guard_level,
            admin: admin,
          }
        }
      };
    } else {
      danmaku = {
        platform: "bilibili",
        room: this.id,
        type: "text",
        local_timestamp: new Date().valueOf(),
        info: {
          timestamp: timestamp,
          text: text,
          color: color,
          mode: mode,
          user: {
            name: uname,
            id: uid,
            medal: medal,
            privilege: guard_level,
            admin: admin,
          }
        },
      };
    }
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
      local_timestamp: new Date().valueOf(),
      info: {
        timestamp: Math.floor(data.trigger_time / 1000000),
        user: {
          name: data.uname,
          id: data.uid,
          medal: (data.fans_medal && data.fans_medal.medal_level) ? {
            level: data.fans_medal.medal_level,
            name: data.fans_medal.medal_name,
            id: data.fans_medal.target_id,
            privilege: data.fans_medal.guard_level,
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
      local_timestamp: new Date().valueOf(),
      info: {
        timestamp: data.timestamp * 1000, // 接口只能获得秒级时间戳
        user: {
          name: data.uname,
          id: data.uid,
          medal: (data.fans_medal && data.fans_medal.medal_level) ? {
            level: data.fans_medal.medal_level,
            name: data.fans_medal.medal_name,
            id: data.fans_medal.target_id,
            privilege: data.fans_medal.guard_level,
          } : null,
          privilege: data.guard_level,
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
    let gift: MessagePrivilege = {
      platform: "bilibili",
      room: this.id,
      type: "privilege",
      local_timestamp: new Date().valueOf(),
      info: {
        timestamp: data.start_time * 1000,
        user: {
          name: data.username,
          id: data.uid,
          privilege: data.guard_level,
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
      local_timestamp: new Date().valueOf(),
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
            privilege: data.medal_info.guard_level,
          } : null,
          privilege: data.user_info.guard_level,
        },
        text: data.message, // 文字
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
      local_timestamp: new Date().valueOf(),
      info: {
        user: {
          id: data.uid,
          name: data.uname
        },
        operator: {
          admin: data.operator == 2 ? 1 : 2
        }
      },
    };
    this.emitMsg(block);
  }
  msg_LIVE(msg: any) {
    // 直播间开播
    if (msg.live_time) {
      let live = {
        platform: "bilibili",
        room: this.id,
        type: "live_start",
        local_timestamp: new Date().valueOf(),
        info: {
          start_time: msg.live_time * 1000,
        },
      };
      this.live.status = "live"
      this.emitMsg(live);
    }
  }
  msg_CUT_OFF(msg: any) {
    // 直播间被切断
    let cut = {
      platform: "bilibili",
      room: this.id,
      type: "live_cut",
      local_timestamp: new Date().valueOf(),
      info: {
        message: msg.msg,
      },
    };
    this.live.status = "off"
    this.emitMsg(cut);
  }
  msg_PREPARING(msg: any) {
    let off = {
      platform: "bilibili",
      room: this.id,
      type: "live_end",
      local_timestamp: new Date().valueOf(),
      info: {
        status: msg.round ? "round" : "off"
      }
    }
    this.live.status = msg.round ? "round" : "off"
    this.emitMsg(off)
  }
}

export default bilibiliLive;
