"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bilibili_live_ws_1 = require("bilibili-live-ws");
const axios_1 = __importDefault(require("axios"));
const events_1 = require("events");
const getRoomInfo_1 = __importDefault(require("../LiveRoom/getRoomInfo"));
class bilibiliLive extends events_1.EventEmitter {
    constructor(id, open = false) {
        super();
        /** 平台id */
        this.platform = "bilibili";
        /** 直播间room_id */
        this.roomid = 0;
        /** 直播标题 */
        this.title = "";
        /** 分区 */
        this.area = [];
        /** 封面url */
        this.cover = "";
        /** 主播信息 */
        this.anchor = { name: "", id: 0 };
        /** 是否持续保持连接 */
        this.keep_connection = true;
        /** 是否正在直播 */
        this.living = false;
        /** 开始直播时间 */
        this.start_time = 0;
        /** 直播间是否被封禁 */
        this.banned = false;
        /** 直播间弹幕api模块 */
        this.client = null;
        /** 是否为持续监听状态 */
        this.opening = false;
        this.id = id; // 直播间号
        this.getInfo().then(() => {
            if (open)
                this.open();
        });
    }
    /** 获取房间信息 */
    async getInfo() {
        await axios_1.default
            .post(`https://api.live.bilibili.com/room/v1/Room/room_init?id=${this.id}`) // 获取直播间信息
            .then((res) => {
            let data = res.data.data;
            this.roomid = data.room_id;
            this.living = data.live_status == 1;
            this.start_time = this.living ? data.live_time * 1000 : 0;
            this.anchor.id = data.uid;
        })
            .catch((error) => {
            console.error(error);
        });
        await axios_1.default
            .get(`https://api.live.bilibili.com/xlive/web-room/v1/index/getRoomBaseInfo?room_ids=${this.roomid}&;req_biz=video`) // 获取直播间信息
            .then((res) => {
            let data = res.data.data.by_room_ids[String(this.roomid)];
            this.anchor.name = data.uname;
            this.title = data.title;
            this.area = [data.parent_area_name, data.area_name];
            this.cover = data.cover;
            this.anchor.avatar = "";
        })
            .catch((error) => {
            console.error(error);
        });
        console.log("[bilibiliLive] 已获取房间信息");
        let roomInfo = (0, getRoomInfo_1.default)(this);
        this.emit("update", roomInfo);
    }
    /** 开启直播间监听 */
    async open() {
        if (this.opening)
            return;
        if (!this.roomid) {
            console.log("[bilibili-live-ws] 未获取直播间room_id属性");
            return;
        }
        this.opening = true;
        this.createWS();
    }
    /** 连接直播服务端 */
    async createWS() {
        // 与Websocket服务器连接
        console.log("[bilibili-live-ws] 开始连接bilibili直播服务器");
        this.client = new bilibili_live_ws_1.LiveWS(this.roomid);
        let client = this.client;
        client.on("open", () => {
            console.log("[bilibili-live-ws] 已连接bilibili直播服务器");
        });
        client.on("close", () => {
            console.log("[bilibili-live-ws] 与bilibili直播服务器的连接已关闭");
        });
        client.on("live", () => {
            console.log("[bilibili-live-ws] 目标房间连接成功");
        });
        client.on("msg", (data) => {
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
        client.on("LIVE", this.msg_LIVE.bind(this));
    }
    close() {
        if (!this.opening)
            return;
        this.opening = false;
        this.client?.close();
    }
    destory() {
        this.close();
        this.removeAllListeners();
    }
    emitMsg(data) {
        // 一般消息
        this.emit("msg", data);
    }
    emitOrigin(data) {
        // 源消息
        this.emit("origin", data);
    }
    getDanmakuMode(n) {
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
    msg_DANMU_MSG(msg) {
        let text = msg.info[1];
        let mode = this.getDanmakuMode(msg.info[0][1]);
        let color = msg.info[0][3];
        let uname = msg.info[2][1];
        let uid = msg.info[2][0];
        let timestamp = msg.info[0][4];
        let guard_level = msg.info[7]; // 舰长级别
        let medal = (msg.info[3].length) ? {
            level: msg.info[3][0],
            name: msg.info[3][1],
            // user: msg.info[3][2],
            id: msg.info[3][12],
            privilege: msg.info[3][10] || 0,
        } : null;
        let admin = undefined;
        if (msg.info[2][2]) {
            admin = 2;
        }
        else if (uid == this.anchor.id) {
            admin = 1;
        }
        let danmaku;
        if (msg.info[0][12]) {
            danmaku = {
                platform: "bilibili",
                room: this.id,
                type: "image",
                local_timestamp: new Date().valueOf(),
                info: {
                    timestamp: timestamp,
                    mode: mode,
                    image: {
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
        }
        else {
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
    msg_INTERACT_WORD(msg) {
        let data = msg.data;
        let type;
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
                type = "interact"; // 进行互动操作
        }
        let interact = {
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
    msg_SEND_GIFT(msg) {
        let data = msg.data;
        let gift = {
            platform: "bilibili",
            room: this.id,
            type: "gift",
            local_timestamp: new Date().valueOf(),
            info: {
                timestamp: data.timestamp * 1000,
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
                },
                gift: {
                    name: data.giftName,
                    id: data.giftId,
                    num: data.num,
                    value: data.total_coin,
                    currency: data.coin_type,
                    combo_id: data.batch_combo_id,
                }
            },
        };
        this.emitMsg(gift);
    }
    /** 获取舰长开通消息 */
    msg_GUARD_BUY(msg) {
        let data = msg.data;
        let gift = {
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
    msg_SUPER_CHAT_MESSAGE(msg) {
        let data = msg.data;
        let sc = {
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
                text: data.message,
                color: data.background_bottom_color,
                duration: data.time * 1000,
                gift: {
                    id: data.gift.gift_id,
                    name: data.gift.gift_name,
                    num: data.gift.num,
                    value: data.price * 1000,
                    currency: "gold",
                }
            },
        };
        this.emitMsg(sc);
    }
    msg_ROOM_BLOCK_MSG(msg) {
        // 禁言
        let data = msg.data;
        let block = {
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
    msg_LIVE(msg) {
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
            this.emitMsg(live);
        }
    }
    msg_CUT_OFF(msg) {
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
        this.emitMsg(cut);
    }
}
exports.default = bilibiliLive;
