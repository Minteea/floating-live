const { LiveWS } = require('bilibili-live-ws')
const axios = require('axios')
const { EventEmitter } = require('events')

class bilibiliLive {
    constructor(id, callbacks = {}, conf = {}) {
        this.id = id        // 直播间号
        this.uid = 0        // 主播uid
        this.roomid = 0     // 直播间room_id
        this.conf = conf    // 配置
        this.event = new EventEmitter() // 事件触发器
        this.open()         // 初始化
        this.giftBuffer = new Map()     // 礼物缓冲池，用于处理连击礼物
    }
    async open() {
        axios.post(`https://api.live.bilibili.com/room/v1/Room/room_init?id=${this.id}`)    // 获取直播间信息
            .then(res => {
                let data = res.data.data
                this.roomid = data.room_id
                this.uid = data.uid
                this.startTime = data.live_time * 1000
                console.log("bilibiliLive.js: 已获取房间信息")
                this.createWS()
                // this.getGuardList()
            })
            .catch(error => {
                console.error(error)
            })
    }
    async createWS() {      // 与Websocket服务器连接
        console.log("bilibili-live-ws: 开始连接bilibili直播服务器")
        this.client = new LiveWS(this.roomid)
        let client = this.client

        client.on('open', () => {
            console.log("bilibili-live-ws: 已连接bilibili直播服务器")
        })
        client.on('close', () => {
            console.log("bilibili-live-ws: 与bilibili直播服务器的连接已关闭")
        })
        client.on('live', () => {
            console.log('bilibili-live-ws: 目标房间连接成功')
        })
        client.on('msg', (data) => {
            this.toTest(data)
        })
        client.on('DANMU_MSG', this.msg_DANMU_MSG.bind(this))
        client.on('ENTRY_EFFECT', this.msg_ENTRY_EFFECT.bind(this))
        client.on('INTERACT_WORD', this.msg_INTERACT_WORD.bind(this))
        client.on('SEND_GIFT', this.msg_SEND_GIFT.bind(this))
        client.on('GUARD_BUY', this.msg_GUARD_BUY.bind(this))
        //client.on('COMBO_SEND', this.msg_COMBO_SEND.bind(this))
        client.on('ROOM_BLOCK_MSG', this.msg_ROOM_BLOCK_MSG.bind(this))
        client.on('SUPER_CHAT_MESSAGE', this.msg_SUPER_CHAT_MESSAGE.bind(this))
        client.on('CUT_OFF', this.msg_CUT_OFF.bind(this))
        client.on('LIVE', this.msg_LIVE.bind(this))
    }
    on(eventName, func) {   // 监听事件
        this.event.on(eventName, func)
    }
    emit(eventName, ...args) {  // 触发事件
        this.event.emit(eventName, ...args)
    }
    close() {
        this.client.close()
    }
    toChat(data) {       // 一般消息
        this.emit('msg', data)
    }
    toGift(data) {       // 礼物消息
        this.emit('gift', data)
    }
    toTest(data) {       // 源消息
        this.emit('origin', data)
    }
    msg_DANMU_MSG(msg) {     // 获取弹幕消息
        let text = msg.info[1]
        let mode = "left"
        let color = msg.info[0][3]
        let user = msg.info[2][1]
        let uid = msg.info[2][0]
        let date = msg.info[0][4]
        let medal = null
        let identity = null
        let mark = null
        switch (msg.info[0][1]) {
            case 1:
                mode = "left"  // 滚动弹幕
                break;
            case 4:
                mode = "bottom" // 底部弹幕
                break;
            case 5:
                mode = "top"  // 顶部弹幕
                break;
        }
        if (msg.info[7]) {  // 舰长级别
            mark = `guard-${msg.info[7]}`
        }
        if (msg.info[3].length) {
            medal = {
                level: msg.info[3][0],
                name: msg.info[3][1],
                // user: msg.info[3][2],
                uid: msg.info[3][12],
                mark: null,
            }
            if (msg.info[3][10]) {  // 粉丝牌舰长级别
                medal.mark = `guard-${msg.info[3][10]}`
            }
        }
        if (msg.info[2][2]) {
            identity = "admin"
        } else if (uid == this.uid) {
            identity = "anchor"
        }
        let danmaku = {}
        if (msg.info[0][12]) {
            danmaku = {
                platform: "bilibili",
                room: this.id,
                type: "image",
                timestamp: date,
                localtime: (new Date()).valueOf(),
                data: {
                    id: msg.info[0][13].emoticon_unique,
                    image: msg.info[0][13].url,
                    size: [msg.info[0][13].width, msg.info[0][13].height],
                    text: text,
                    mode: mode,
                    color: color,
                    user: user,
                    uid: uid,
                    date: date,
                    medal: medal,
                    identity: identity,
                    mark: mark,
                }
            }
        } else {
            danmaku = {
                platform: "bilibili",
                room: this.id,
                type: "text",
                timestamp: date,
                localtime: (new Date()).valueOf(),
                data: {
                    text: text,
                    mode: mode,
                    color: color,
                    user: user,
                    uid: uid,
                    date: date,
                    medal: medal,
                    identity: identity,
                    mark: mark,
                }
            }
        }
        this.toChat(danmaku)
    }
    async msg_ENTRY_EFFECT(msg) {      // 进入直播间特效
        let data = msg.data
        let date = parseInt(data.trigger_time / 1000000)
        let uid = data.uid
        let medal = null
        let label
        let labelText
        switch (data.id) {
            case 1: // 总督
                label = "guard-1"
                break
            case 2: // 提督
                label = "guard-2"
                break
            case 4: // 舰长
                label = "guard-3"
                break

            case 135: // 榜1
                label = "rank-1"
                break
            case 136: // 榜2
                label = "rank-2"
                break
            case 137: // 榜3
                label = "rank-3"
                break

            default:
                label = null
        }
        let userInfoGet = await axios
            .get(`https://api.bilibili.com/x/space/acc/info?mid=${uid}`)
            .catch(error => {console.error(error); return {
                data: {
                    data: {
                        name: "unknown",
                        medal: null
                    }
                }
            }})
        let userData = userInfoGet.data.data
        let user = userData.name
        if (userData.fans_medal.medal) {
            medal = {
                level: userData.fans_medal.medal.level,
                name: userData.fans_medal.medal.medal_name,
                uid: userData.fans_medal.medal.target_id,
                mark: null,
            }
            if (userData.fans_medal.medal.guard_level) {    // 粉丝牌舰长级别
                medal.mark = `guard-${userData.fans_medal.medal.guard_level}`
            }
        }
        let entry = {
            platform: "bilibili",
            room: this.id,
            type: "entry_effect",
            timestamp: date,
            localtime: (new Date()).valueOf(),
            data: {
                user: user,
                uid: uid,
                date: date,
                medal: medal,
                label: label,
            }
        }
        this.toChat(entry)
    }
    msg_INTERACT_WORD(msg) {     // 互动
        let data = msg.data
        let date = parseInt(data.trigger_time / 1000000)
        let user = data.uname
        let uid = data.uid
        let type
        let medal = null
        if (data.fans_medal && data.fans_medal.medal_level) {
            medal = {
                level: data.fans_medal.medal_level,
                name: data.fans_medal.medal_name,
                uid: data.fans_medal.target_id,
            }
        }
        switch (data.msg_type) {
            case 1:
                type = "entry"  // 进入直播间
                break;
            case 2:
                type = "follow" // 关注直播间
                break;
            case 3:
                type = "share"  // 分享直播间
                break;
            default:
                type = "interact"   // 进行互动操作
        }
        let interact = {
            platform: "bilibili",
            room: this.id,
            type: type,
            timestamp: date,
            localtime: (new Date()).valueOf(),
            data: {
                user: user,
                uid: uid,
                date: date,
                medal: medal,
            }
        }
        this.toChat(interact)
    }
    msg_SEND_GIFT(msg) {     // 送礼
        let data = msg.data
        let date = data.timestamp * 1000
        let medal = null
        let mark = null
        if (data.guard_level) { // 舰长级别
            mark = `guard-${data.guard_level}`
        }
        if (data.medal_info && data.medal_info.medal_level) {
            medal = {
                level: data.medal_info.medal_level,
                name: data.medal_info.medal_name,
                uid: data.medal_info.target_id,
                mark: null
            }
            if (data.medal_info.guard_level) {  // 粉丝牌舰长级别
                medal.mark = `guard-${data.medal_info.guard_level}`
            }
        }
        let gift = {
            platform: "bilibili",
            room: this.id,
            type: "gift",
            timestamp: date,
            localtime: (new Date()).valueOf(),
            data: {
                name: data.giftName,        // 礼物名称
                giftId: data.giftId,        // 礼物id
                num: data.num,              // 礼物数量
                cost: data.total_coin,      // 总花费
                coinType: data.coin_type,   // 货币种类
                user: data.uname,           // 用户名
                uid: data.uid,              // 用户uid
                date: date,                 // 日期(ms时间戳)
                medal: medal,               // 粉丝勋章
                mark: mark                  // 标识
            }
        }
        let combo = {
            batch_combo_id: data.batch_combo_id,    // 礼物发送标识码，用于合并连续送礼
        }
        this.toChat(gift)
        this.bufGift(gift, combo)
    }
    msg_COMBO_SEND(msg) {    // 礼物combo

    }
    msg_GUARD_BUY(msg) {     // 舰长购买
        let data = msg.data
        let date = data.start_time * 1000
        let gift = {
            platform: "bilibili",
            room: this.id,
            type: "guard_buy",
            timestamp: date,
            localtime: (new Date()).valueOf(),
            data: {
                name: data.gift_name,   // 礼物名称
                giftId: data.gift_id,   // 礼物id
                num: data.num,          // 礼物数量
                cost: data.price,       // 总花费
                coinType: "gold",       // 货币种类
                guardLevel: data.guard_level,   // 舰长级别
                user: data.username,    // 用户名
                uid: data.uid,          // UID
                date: date,             // 日期
            }
        }
        this.toChat(gift)
    }
    msg_SUPER_CHAT_MESSAGE(msg) {   // 醒目留言
        let data = msg.data
        let date = data.ts * 1000
        let mark = null
        let medal = null
        if (data.user_info.guard_level) {
            mark = `guard-${data.user_info.guard_level}`
        }
        if (data.medal_info && data.medal_info.medal_level) {
            medal = {
                level: data.medal_info.medal_level,
                name: data.medal_info.medal_name,
                uid: data.medal_info.target_id,
                mark: null
            }
            if (data.medal_info.guard_level) {  // 粉丝牌舰长级别
                medal.mark = `guard-${data.medal_info.guard_level}`
            }
        }
        let sc = {
            platform: "bilibili",
            room: this.id,
            type: "superchat",
            timestamp: date,
            localtime: (new Date()).valueOf(),
            data: {
                text: data.message,         // 文字
                time: data.time * 1000,     // 持续时间(ms)
                name: data.gift.gift_name,  // 礼物名称
                giftId: data.gift.gift_id,  // 礼物id
                num: data.gift.num,         // 礼物数量
                cost: data.price * 1000,    // 花费
                coinType: "gold",           // 货币种类
                user: data.user_info.uname, // 用户名
                uid: data.uid,              // UID
                medal: medal,               // 粉丝勋章
                mark: mark,
                date: date,                 // 日期
            }
        }
        this.toChat(sc)
    }
    msg_ROOM_BLOCK_MSG(msg) {   // 禁言
        let data = msg.data
        let ban = {
            platform: "bilibili",
            room: this.id,
            type: "ban",
            localtime: (new Date()).valueOf(),
            data: {
                user: data.uname,
                uid: data.uid,
            }
        }
        this.toChat(ban)
    }
    msg_LIVE(msg) {          // 直播间开播
        if (msg.live_time) {
            let live = {
                platform: "bilibili",
                room: this.id,
                type: "live_start",
                timestamp: msg.live_time * 1000,
                localtime: (new Date()).valueOf(),
                data: {
                    startTime: msg.live_time,
                }
            }
            this.toChat(live)
        }
    }
    msg_CUT_OFF(msg) {      // 直播间被切断
        let cut = {
            platform: "bilibili",
            room: this.id,
            type: "live_cut",
            localtime: (new Date()).valueOf(),
            data: {
                text: msg.msg
            }
        }
        this.toChat(cut)
    }
    bufGift(data, combo) {   // 将礼物信息放入缓冲池
        let buf = {
            gift: data,
            combo: combo,
            timer: setTimeout(() => { }, 10000),
        }
    }
    endBufGift(batch_combo_id) {       // 结束礼物缓冲
        let buf = this.giftBuffer.get(batch_combo_id)
        let gift = buf.gift
        if (buf) {
            this.toChat(gift)
            clearTimeout(buf.timer)
            this.giftBuffer.delete(batch_combo_id)
        }
    }
}

module.exports = bilibiliLive
