import { RawInfo } from "./types";
import { RoomStatus } from "../..";
import { UserInfo } from "../..";
import { KeepLiveWS } from "bilibili-live-ws";
import { RoomStatsInfo, RoomDetail } from "../..";
import { RawMessage } from "./types";
import { parseMessage } from "./parser";
import { LiveRoom } from "../../src/abstract/LiveRoom";
import { getBuvid, getKey, getLoginUid } from "./utils";

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

class RoomBilibili extends LiveRoom {
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
    view: 0,
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

  #auth = "";

  private userId: number = 0;
  private buvid: string = "";
  private token: string = "";

  /** 是否处于正在打开的状态 */
  private opening: boolean = false;

  constructor(
    /** 房间id */
    id: number,
    /** 生成房间后是否打开 */
    open: boolean = false,
    /** 配置项 */
    config?: {
      /** 登录凭据 */
      auth?: string;
      /** 断线重连间隔(默认值为100ms) */
      connectInterval?: number;
    }
  ) {
    super();
    this.id = id; // 直播间号
    this.connectInterval = config?.connectInterval || 100;
    this.#auth = config?.auth || "";

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
        const { room_info, anchor_info, like_info_v3, watched_show }: RawInfo =
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
        this.stats.view = watched_show.num;
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
    return this.info;
  }
  /** 开启直播间监听 */
  async open() {
    // 如果直播间监听已打开或处于正在打开状态，则返回
    if (this.opened || this.opening) return;
    this.opening = true;
    await this.getInfo();
    await this.initAuth();
    this.opening = false;
    // 如果直播间不可用，则返回
    if (!this.available) return;
    this.opened = true;
    this.createWS();
    this.emit("open");
  }
  /** 设置登录凭据 */
  public setAuth(auth: string) {
    this.#auth = auth;
    this.initAuth();
  }
  /** 初始化登录凭据 */
  private async initAuth() {
    this.userId = (await getLoginUid(this.#auth)) || 0;
    this.buvid = (await getBuvid(this.#auth)) || "";
    this.token = (await getKey(this.roomid, this.#auth)) || "";
    if (this.opened) {
      // 如果已打开，则重新开一个登录后的连接客户端
      const lastClient = this.client;
      this.createWS();
      this.client?.once("open", () => {
        lastClient?.removeAllListeners();
        lastClient?.close();
      });
    }
  }
  /** 连接直播服务端 */
  createWS() {
    // 与Websocket服务器连接
    console.log("[bilibili-live-ws] 开始连接bilibili直播服务器");
    this.client = new KeepLiveWS(this.roomid, {
      uid: this.userId,
      buvid: this.buvid,
      key: this.token,
    });
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
      this.emitRaw(data);
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
    if (!this.opened) return;
    this.opened = false;
    this.client?.close();
    this.emit("close");
  }
  /** 获取弹幕消息 */
  public msg_DANMU_MSG(msg: RawMessage.DANMU_MSG) {
    const m = parseMessage(msg, this);
    m && this.emitMsg(m);
  }
  /** 获取互动消息 */
  public msg_INTERACT_WORD(msg: RawMessage.INTERACT_WORD) {
    const m = parseMessage(msg, this);
    m && this.emitMsg(m);
  }
  /** 获取礼物消息 */
  public msg_SEND_GIFT(msg: RawMessage.SEND_GIFT) {
    const m = parseMessage(msg, this);
    m && this.emitMsg(m);
  }
  /** 获取舰长开通消息 */
  public msg_GUARD_BUY(msg: RawMessage.GUARD_BUY) {
    const m = parseMessage(msg, this);
    m && this.emitMsg(m);
  }
  /** 获取醒目留言消息 */
  public msg_SUPER_CHAT_MESSAGE(msg: RawMessage.SUPER_CHAT_MESSAGE) {
    const m = parseMessage(msg, this);
    m && this.emitMsg(m);
  }
  /** 观看数变化 */
  public msg_WATCHED_CHANGE(msg: RawMessage.WATCHED_CHANGE) {
    const m = parseMessage(msg, this);
    m && this.emitMsg(m);
  }
  /** 点赞数变化 */
  public msg_LIKE_INFO_V3_UPDATE(msg: RawMessage.LIKE_INFO_V3_UPDATE) {
    const m = parseMessage(msg, this);
    m && this.emitMsg(m);
  }
  public msg_ONLINE_RANK_COUNT(msg: RawMessage.ONLINE_RANK_COUNT) {
    const m = parseMessage(msg, this);
    m && this.emitMsg(m);
  }
  msg_ROOM_BLOCK_MSG(msg: RawMessage.ROOM_BLOCK_MSG) {
    const m = parseMessage(msg, this);
    m && this.emitMsg(m);
  }
  msg_LIVE(msg: RawMessage.LIVE) {
    const m = parseMessage(msg, this);
    m && this.emitMsg(m);
  }
  msg_CUT_OFF(msg: RawMessage.CUT_OFF) {
    const m = parseMessage(msg, this);
    m && this.emitMsg(m);
  }
  msg_PREPARING(msg: RawMessage.PREPARING) {
    const m = parseMessage(msg, this);
    m && this.emitMsg(m);
  }
  msg_ROOM_CHANGE(msg: RawMessage.ROOM_CHANGE) {
    const m = parseMessage(msg, this);
    m && this.emitMsg(m);
  }
}

export default RoomBilibili;
