import { generateId, ImageSize, RoomStatus, UserType } from "../..";
import { ImageInfo, UserInfo } from "../..";
import { KeepLiveWS } from "bilibili-live-ws";
import { LiveRoom, RoomStatsInfo, RoomDetail } from "../..";
import {
  MessageBlock,
  MessageChat,
  MessageGift,
  MessageInteract,
  MessageLiveCut,
  MessageLiveEnd,
  MessageLiveStart,
  MessageLiveStats,
  MessageLiveDetail,
  MessageMembership,
  MessageSuperchat,
} from "../..";

// utils

// 获取当前时间戳，以替代无法从数据中获取时间戳的情况，精度为1s
function getDateTimestamp() {
  return Math.floor(Date.now() / 1000) * 1000;
}

function getRoomStatus(s: number) {
  switch (s) {
    case 1:
      return RoomStatus.live;
    case 2:
      return RoomStatus.round;
    default:
      return RoomStatus.off;
  }
}

class bilibiliLive extends LiveRoom {
  /** 平台id */
  readonly platform: string = "bilibili";
  /** 直播间号 */
  readonly id: number;
  /** 直播间room_id */
  public roomid: number = 0;
  /** 房间信息 */
  public detail: RoomDetail = {
    /** 直播标题 */
    title: "",
    /** 分区 */
    area: [],
    /** 封面url */
    cover: "",
  };
  public stats: RoomStatsInfo = {
    /** 观看数 */
    watch: 0,
    /** 点赞数 */
    like: 0,
  };
  /** 房间是否可用 */
  public available: boolean = false;
  /** 是否连接上房间 */
  public connected: boolean = false;
  /** 主播信息 */
  public anchor: UserInfo = { name: "", id: 0 };
  /** 直播间弹幕api模块 */
  public client: KeepLiveWS | null = null;
  /** 断线重连间隔 */
  public connectInterval: number;

  constructor(
    id: number, // 房间id
    open: boolean = false, // 生成房间后是否打开
    config?: {
      connectInterval: number; // 断线重连间隔(默认值为100ms)
    }
  ) {
    super();
    this.id = id; // 直播间号
    this.connectInterval = config?.connectInterval || 100;
    if (open) {
      this.open();
    } else {
      this.getInfo();
    }
  }
  /** 获取房间信息 */
  public async getInfo() {
    await fetch(
      `https://api.live.bilibili.com/xlive/web-room/v1/index/getInfoByRoom?room_id=${this.id}`,
      {
        method: "GET",
      }
    ) // 获取直播间信息
      .then((response) => response.json())
      .then((res) => {
        const { room_info, anchor_info, like_info_v3, watched_show }: any =
          res.data;
        this.roomid = room_info.room_id;
        this.status = room_info.lock_status
          ? RoomStatus.banned
          : getRoomStatus(room_info.live_status);
        this.timestamp =
          this.status == RoomStatus.live
            ? room_info.live_start_time * 1000
            : this.timestamp;
        this.detail.title = room_info.title;
        this.detail.area = [room_info.parent_area_name, room_info.area_name];
        this.detail.cover = room_info.cover;
        this.stats.watch = watched_show.num;
        this.stats.like = like_info_v3.total_likes;
        this.anchor.id = room_info.uid;
        this.anchor.name = anchor_info.base_info.uname;
        this.anchor.avatar = anchor_info.base_info.face;
        this.liveId = room_info.live_id_str;
        this.available = true;
        console.log("[bilibiliLive] 已获取房间信息");
        this.emit("info", this.info);
      })
      .catch((error) => {
        console.error(error);
      });
  }
  /** 开启直播间监听 */
  async open() {
    // 如果直播间监听已打开，则返回
    if (this.opening) return;
    await this.getInfo();
    // 如果直播间不可用，则返回
    if (!this.available) return;
    this.opening = true;
    this.createWS();
    this.emit("open");
  }
  /** 连接直播服务端 */
  async createWS() {
    // 与Websocket服务器连接
    console.log("[bilibili-live-ws] 开始连接bilibili直播服务器");
    this.client = new KeepLiveWS(this.roomid, { uid: this.anchor.id });
    let client = this.client;

    client.interval = this.connectInterval;

    client.on("open", () => {
      console.log("[bilibili-live-ws] 已连接bilibili直播服务器");
      this.emit("connect");
    });
    client.on("close", () => {
      console.log("[bilibili-live-ws] 与bilibili直播服务器的连接已关闭");
      this.emit("disconnect");
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
    client.on("ROOM_CHANGE", this.msg_ROOM_CHANGE.bind(this));
    client.on("WATCHED_CHANGE", this.msg_WATCHED_CHANGE.bind(this));
    client.on("LIKE_INFO_V3_UPDATE", this.msg_LIKE_INFO_V3_UPDATE.bind(this));
    client.on("ONLINE_RANK_COUNT", this.msg_ONLINE_RANK_COUNT.bind(this));
  }
  /** 关闭直播间监听 */
  close() {
    if (!this.opening) return;
    this.opening = false;
    this.client?.close();
    this.emit("close");
  }
  /** 获取弹幕消息 */
  public msg_DANMU_MSG(msg: any) {
    const { info, msg_id } = msg;
    let content = info[1];
    let mode = info[0][1];
    let color = info[0][3];
    let uname = info[2][1];
    let uid = info[2][0];
    let timestamp = info[0][4];
    let guard_level = info[7]; // 舰长级别
    let extra = JSON.parse(info[0][15].extra);
    let medal = info[3].length
      ? {
          level: info[3][0],
          name: info[3][1],
          // user: info[3][2],
          id: info[3][12],
          membership: info[3][10] || 0,
        }
      : null;
    let identity: null | UserType = 0;
    let emoticon: { [key: string]: ImageInfo } | undefined = undefined;
    if (extra.emots) {
      emoticon = {};
      for (let key in extra.emots) {
        let emotItem = extra.emots[key];
        emoticon[key] = {
          id: emotItem.emoticon_unique,
          url: emotItem.url,
          name: emotItem.emoji,
        };
      }
    }
    if (info[2][2]) {
      identity = UserType.admin;
    } else if (uid == this.anchor.id) {
      identity = UserType.anchor;
    }
    let danmaku: MessageChat = {
      platform: "bilibili",
      room: this.id,
      type: "chat",
      timestamp: timestamp,
      id: msg_id,
      info: {
        color: color,
        mode: mode,
        content: content,
        image: info[0][12]
          ? {
              name: content,
              id: info[0][13].emoticon_unique,
              url: info[0][13].url,
              size:
                info[0][13].width == info[0][13].height
                  ? ImageSize.large
                  : ImageSize.small,
            }
          : undefined,
        emoticon: emoticon,
        user: {
          name: uname,
          id: uid,
          medal: medal,
          membership: guard_level,
          type: identity,
        },
      },
    };
    danmaku.id ??= generateId(danmaku);
    this.emitMsg(danmaku);
  }
  /** 获取互动消息 */
  public msg_INTERACT_WORD(msg: any) {
    const { data, msg_id, send_time } = msg;
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
        return;
    }
    let interact: MessageInteract = {
      platform: "bilibili",
      room: this.id,
      type: type,
      id: msg_id,
      timestamp: send_time || Math.floor(data.trigger_time / 1000000),
      info: {
        user: {
          name: data.uname,
          id: data.uid,
          medal: data.fans_medal?.medal_level
            ? {
                level: data.fans_medal.medal_level,
                name: data.fans_medal.medal_name,
                id: data.fans_medal.target_id,
                membership: data.fans_medal.guard_level,
              }
            : null,
        },
      },
    };
    interact.id ??= generateId(interact);
    this.emitMsg(interact);
  }
  /** 获取礼物消息 */
  public msg_SEND_GIFT(msg: any) {
    const { data, msg_id, send_time } = msg;
    let gift: MessageGift = {
      platform: "bilibili",
      room: this.id,
      type: "gift",
      id: msg_id || data.combo_id,
      timestamp: send_time || data.timestamp * 1000,
      info: {
        user: {
          name: data.uname,
          id: data.uid,
          medal:
            data.fans_medal && data.fans_medal.medal_level
              ? {
                  level: data.fans_medal.medal_level,
                  name: data.fans_medal.medal_name,
                  id: data.fans_medal.target_id,
                  membership: data.fans_medal.guard_level,
                }
              : null,
          membership: data.guard_level,
          avatar: data.face,
        },
        gift: {
          name: data.giftName,
          id: data.giftId,
          num: data.num,
          value: data.total_coin,
          currency: data.coin_type,
          action: data.action,
          comboId: data.batch_combo_id,
        },
      },
    };
    gift.id ??= generateId(gift);
    this.emitMsg(gift);
  }
  /** 获取舰长开通消息 */
  public msg_GUARD_BUY(msg: any) {
    const { data, msg_id, send_time } = msg;
    let gift: MessageMembership = {
      platform: "bilibili",
      room: this.id,
      type: "membership",
      id: msg_id,
      timestamp: send_time || data.start_time * 1000,
      info: {
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
    gift.id ??= generateId(gift);
    this.emitMsg(gift);
  }
  /** 获取醒目留言消息 */
  public msg_SUPER_CHAT_MESSAGE(msg: any) {
    const { data, msg_id, send_time } = msg;
    let sc: MessageSuperchat = {
      platform: "bilibili",
      room: this.id,
      type: "superchat",
      id: msg_id,
      timestamp: send_time || data.ts * 1000,
      info: {
        id: data.id,
        user: {
          name: data.user_info.uname,
          id: data.uid,
          avatar: data.user_info.face,
          medal:
            data.medal_info && data.medal_info.medal_level
              ? {
                  level: data.medal_info.medal_level,
                  name: data.medal_info.medal_name,
                  id: data.medal_info.target_id,
                  membership: data.medal_info.guard_level,
                }
              : null,
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
        },
      },
    };
    sc.id ??= generateId(sc);
    this.emitMsg(sc);
  }
  /** 观看数变化 */
  public msg_WATCHED_CHANGE(msg: any) {
    const { data, msg_id, send_time } = msg;
    const stats: MessageLiveStats = {
      platform: "bilibili",
      room: this.id,
      type: "live_stats",
      id: msg_id,
      timestamp: send_time || getDateTimestamp(),
      info: {
        watch: data.num,
      },
    };
    stats.id ??= generateId(stats);
    this.emitMsg(stats);
  }
  /** 点赞数变化 */
  public msg_LIKE_INFO_V3_UPDATE(msg: any) {
    const { data, msg_id, send_time } = msg;
    const stats: MessageLiveStats = {
      platform: "bilibili",
      room: this.id,
      type: "live_stats",
      id: msg_id,
      timestamp: send_time || getDateTimestamp(),
      info: {
        like: data.click_count,
      },
    };
    stats.id ??= generateId(stats);
    this.emitMsg(stats);
  }
  public msg_ONLINE_RANK_COUNT(msg: any) {
    const { data, msg_id, send_time } = msg;
    const stats: MessageLiveStats = {
      platform: "bilibili",
      room: this.id,
      type: "live_stats",
      id: msg_id,
      timestamp: send_time || getDateTimestamp(),
      info: {
        online: data.online_count,
      },
    };
    stats.id ??= generateId(stats);
    if (data.online_count != null) this.emitMsg(stats);
  }
  msg_ROOM_BLOCK_MSG(msg: any) {
    // 禁言
    const { data, msg_id, send_time } = msg;
    const block: MessageBlock = {
      platform: "bilibili",
      room: this.id,
      type: "block",
      id: msg_id,
      timestamp: send_time || getDateTimestamp(),
      info: {
        user: {
          id: data.uid,
          name: data.uname,
        },
        operator: {
          type: data.operator == 2 ? UserType.anchor : UserType.admin,
        },
      },
    };
    block.id ??= generateId(block);
    this.emitMsg(block);
  }
  msg_LIVE(msg: any) {
    const { data, msg_id, send_time } = msg;
    // 直播间开播
    if (msg.live_time) {
      let live: MessageLiveStart = {
        platform: "bilibili",
        room: this.id,
        type: "live_start",
        id: msg_id,
        timestamp: send_time || msg.live_time * 1000,
        info: {
          id: msg.live_key.toString(),
        },
      };
      live.id ??= generateId(live);
      this.emitMsg(live);
    }
  }
  msg_CUT_OFF(msg: any) {
    const { msg_id, send_time } = msg;
    // 直播间被切断
    let cut: MessageLiveCut = {
      platform: "bilibili",
      room: this.id,
      type: "live_cut",
      id: msg_id,
      timestamp: send_time || getDateTimestamp(),
      info: {
        message: msg.msg,
      },
    };
    cut.id ??= generateId(cut);
    this.emitMsg(cut);
  }
  msg_PREPARING(msg: any) {
    const { msg_id, send_time } = msg;
    let off: MessageLiveEnd = {
      platform: "bilibili",
      room: this.id,
      type: "live_end",
      id: msg_id,
      timestamp: send_time || getDateTimestamp(),
      info: {
        status: msg.round ? RoomStatus.round : RoomStatus.off,
      },
    };
    off.id ??= generateId(off);
    this.emitMsg(off);
  }
  msg_ROOM_CHANGE(msg: any) {
    const { data, msg_id, send_time } = msg;
    let change: MessageLiveDetail = {
      platform: "bilibili",
      room: this.id,
      type: "live_detail",
      id: msg_id,
      timestamp: send_time || getDateTimestamp(),
      info: {
        title: data.title,
        area: [data.parent_area_name, data.area_name],
      },
    };
    change.id ??= generateId(change);
    this.emitMsg(change);
  }
}

export default bilibiliLive;
