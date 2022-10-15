"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-ignore
const ac_danmu_1 = __importDefault(require("ac-danmu"));
const events_1 = require("events");
class acfunLive extends events_1.EventEmitter {
    constructor(id, open = false) {
        super();
        /** 平台id */
        this.platform = "acfun";
        /** 直播标题 */
        this.title = "";
        /** 分区 */
        this.area = [];
        /** 封面url */
        this.cover = "";
        /** 主播信息 */
        this.anchor = { name: "", id: 0 };
        /** 是否持续保持连接 */
        this.keep_connection = false;
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
        this.platform = "acfun";
        this.id = id; // 直播间号
        this.anchor.id = id; // 主播uid
        this.getInfo().then(() => {
            if (open)
                this.open();
        });
        console.log("连接直播间");
    }
    async getInfo() {
    }
    /** 开启直播间监听 */
    async open() {
        if (this.opening)
            return;
        this.opening = true;
        this.createWS();
    }
    /** 连接直播服务端 */
    async createWS() {
        this.client = await (0, ac_danmu_1.default)(this.id);
        let client = this.client;
        //启动websocket连接
        client.wsStart();
        client.on("enter", () => {
            console.log("acfunLive: 已连接AcFun直播间");
        });
        client.on("recent-comment", (comments) => {
            //当前弹幕列表
        });
        client.on("danmaku", (danmaku) => {
            //收到的弹幕
            this.msg_danmaku(danmaku);
        });
        client.on("gift", (gift) => {
            //收到的礼物
            this.msg_gift(gift);
        });
        client.on("user-enter", (entry) => {
            //用户进入直播间
            this.msg_interact(entry, "entry");
        });
        client.on("like", (like) => {
            //用户点赞
            this.msg_interact(like, "like");
        });
        client.on("join-club", (join) => {
            //用户加入守护团
            this.msg_interact(join, "join");
        });
        client.on("live-info", (info) => {
            //直播间数据状态
            this.msg_live_info(info);
        });
        client.on("liveclose", (end) => {
            console.log("acfunLive: 直播已结束或中断");
        });
        this.initOrigin();
    }
    close() {
        console.log("acfunLive: 暂不支持手动关闭客户端");
    }
    destory() {
        this.close();
    }
    ;
    /** 根据守护徽章字符串获取粉丝牌信息 */
    getMedal(badge) {
        if (badge) {
            let medalInfo = JSON.parse(badge).medalInfo;
            return {
                name: medalInfo.clubName,
                id: medalInfo.uperId,
                level: medalInfo.level,
            };
        }
        else {
            return null;
        }
    }
    /** 文本信息(danmaku) */
    msg_danmaku(data) {
        let danmaku = {
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
    msg_gift(data) {
        let gift = {
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
                    name: data.giftName,
                    id: parseInt(data.giftId),
                    num: data.count,
                    currency: "coin",
                    value: parseInt(data.value), // 总价值
                },
                timestamp: parseInt(data.sendTimeMs),
            },
        };
        this.emitMsg(gift);
    }
    /** 互动信息 */
    msg_interact(data, type) {
        let like = {
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
    msg_live_info(data) {
        // this.toData(msg)
    }
    emitMsg(data) {
        // 一般消息
        this.emit("msg", data);
    }
    emitOrigin(data) {
        // 源消息
        this.emit("origin", data);
    }
    initOrigin() {
        this.client.on("recent-comment", (comments) => {
            //当前弹幕列表
            this.emitOrigin(comments);
        });
        this.client.on("danmaku", (danmaku) => {
            //收到的弹幕
            this.emitOrigin({ type: "danmaku", data: danmaku });
        });
        this.client.on("like", (like) => {
            //收到的点赞
            this.emitOrigin({ type: "like", data: like });
        });
        this.client.on("gift", (gift) => {
            //收到的礼物
            this.emitOrigin({ type: "gift", data: gift });
        });
        this.client.on("user-enter", (entry) => {
            //用户进入直播间
            this.emitOrigin({ type: "user-enter", data: entry });
        });
        this.client.on("join-club", (join) => {
            //用户加入守护团
            this.emitOrigin({ type: "join-club", data: join });
        });
        this.client.on("live-info", (info) => {
            //直播间数据状态
            this.emitOrigin({ type: "live-info", data: info });
        });
    }
}
exports.default = acfunLive;
