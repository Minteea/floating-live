const AcClient = require("ac-danmu")

class acfunLive {
    constructor (id, callbacks = {}, conf = {}) {
        this.id = id        // 直播间号
        this.uid = 0        // 主播uid
        this.conf = conf
        this.init(id)
        this.callbacks = callbacks
        console.log("连接直播间")
    }
    async init(id) {
        const client = await AcClient(id)
        this.client = client
        //启动websocket连接
        client.wsStart();
        client.on("enter", () => {
            console.log("acfunLive: 已连接AcFun直播间");
        });
        client.on("recent-comment", (comments) => {    //当前弹幕列表
            
        });
        client.on("danmaku", (danmaku) => {     //收到的弹幕
            this.msg_danmaku(danmaku)
        });
        client.on("gift", (gift) => {           //收到的礼物
            this.msg_gift(gift)
        });
        client.on("user-enter", (entry) => {    //用户进入直播间
            this.msg_user_enter(entry)
        });
        client.on("join-club", (join) => {      //用户加入守护团
            this.msg_join_club(join)
        });
        client.on("live-info", (info) => {      //直播间数据状态
            this.msg_live_info(info)
        });
        client.on("liveclose", (end) => {
            console.log("acfunLive: 直播已结束或中断")
        })
        this.openTest(id)
    }
    msg_danmaku(data) {
        let date = parseInt(data.sendTimeMs)
        let medal = null
        let identity = data.userInfo.userIdentity
        if (data.userInfo.badge) {
            let medalInfo = (JSON.parse(data.userInfo.badge)).medalInfo
            medal = {
                name: medalInfo.clubName,
                uid: medalInfo.uperId,
                level: medalInfo.level,
            }
        }
        let danmaku = {
            platform: "acfun",
            type: "text",
            timeStamp: date,
            data: {
                text: data.content,
                user: data.userInfo.nickname,
                uid: parseInt(data.userInfo.userId),
                date: date,
                medal: medal,
                identity: identity,
            },
        }
        this.toChat(danmaku)
    }
    msg_gift(data) {
        let date = parseInt(data.sendTimeMs)
        let medal = null
        let identity = data.user.userIdentity
        if (data.user.badge) {
            let medalInfo = (JSON.parse(data.user.badge)).medalInfo
            medal = {
                name: medalInfo.clubName,
                uid: medalInfo.uperId,
                level: medalInfo.level,
            }
        }
        let gift = {
            platform: "acfun",
            type: "gift",
            timeStamp: date,
            data: {
                name: data.giftName,        // 礼物名称
                giftId: parseInt(data.giftId),        // 礼物id
                num: data.count,              // 礼物数量
                cost: parseInt(data.value),      // 总花费
                coinType: "coin",   // 货币种类
                user: data.user.nickname,           // 用户名
                uid: parseInt(data.user.userId),    // 用户uid
                date: date,                 // 日期(ms时间戳)
                medal: medal,               // 粉丝勋章
                identity: identity,
            },
        }
        this.toChat(gift)
    }
    msg_user_enter(data) {
        let date = parseInt(data.sendTimeMs)
        let medal = null
        let identity = data.userInfo.userIdentity
        if (data.userInfo.badge) {
            let medalInfo = (JSON.parse(data.userInfo.badge)).medalInfo
            medal = {
                name: medalInfo.clubName,
                uid: medalInfo.uperId,
                level: medalInfo.level,
            }
        }
        let entry = {
            platform: "acfun",
            type: "entry",
            timestamp: date,
            data: {
                user: data.userInfo.nickname,           // 用户名
                uid: parseInt(data.userInfo.userId),    // 用户uid
                date: date,
                medal: medal,
            },
            identity: identity
        }
        this.toChat(entry)
    }
    msg_join_club(data) {

    }
    msg_live_info(data) {
        // this.toData(msg)
    }
    toChat(msg) {       // 数据由chat模块处理
        if (this.callbacks.chat) this.callbacks.chat(msg)
    }
    toTest(msg) {       // 数据由test模块处理
        if (this.callbacks.test) this.callbacks.test(msg)
    }
    openTest() {
        this.client.on("recent-comment", (comments) => {   //当前弹幕列表
            this.toTest(comments)
        });
        this.client.on("danmaku", (danmaku) => {    //收到的弹幕
            this.toTest({type: "chat", data: danmaku})
        });
        this.client.on("gift", (gift) => {          //收到的礼物
            this.toTest({type: "gift", data: gift})
        });
        this.client.on("user-enter", (entry) => {   //用户进入直播间
            this.toTest({type: "entry", data: entry})
        });
        this.client.on("join-club", (join) => {     //用户加入守护团
            this.toTest({type: "join", data: join})
        });
        this.client.on("live-info", (info) => {     //直播间数据状态
            this.toTest({type: "live-info", data: info})
        });
    }
}



module.exports = acfunLive
