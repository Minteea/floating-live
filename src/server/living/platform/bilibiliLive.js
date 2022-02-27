const { LiveWS } = require('bilibili-live-ws')
const axios = require('axios')
const { EventEmitter } = require('events')

class bilibiliLive {
    constructor (id, callbacks = {}, conf = {}) {
        this.id = id        // 直播间号
        this.uid = 0        // 主播uid
        this.roomid = 0     // 直播间room_id
        this.conf = conf    // 配置
        this.event = new EventEmitter() // 事件触发器
        this.init()         // 初始化
        this.giftBuffer = new Map()     // 礼物缓冲池，用于处理连击礼物
    }
    async init() {
        axios.post(`https://api.live.bilibili.com/room/v1/Room/room_init?id=${this.id}`)    // 获取直播间信息
        .then(res => {
            let data = res.data.data
            this.roomid = data.room_id
            this.uid = data.uid
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
        const client = new LiveWS(this.roomid)
        this.client = client

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
        client.on('COMBO_SEND', this.msg_COMBO_SEND.bind(this))
        client.on('ROOM_BLOCK_MSG', this.msg_ROOM_BLOCK_MSG.bind(this))
    }
    on(eventName, func) {   // 监听事件
        this.event.on(eventName, func)
    }
    emit(eventName, ...args) {  // 触发事件
        this.event.emit(eventName, ...args)
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
        switch (msg.info[0][1]){
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
        if (msg.info[3].length) {
            medal = {
                level: msg.info[3][0],
                name: msg.info[3][1],
                // user: msg.info[3][2],
                uid: msg.info[3][12],
                mark: null,
            }
            switch (msg.info[3][10]){
                case 1:
                    medal.mark = "guard-1"  // 舰长
                    break;
                case 2:
                    medal.mark = "guard-2"  // 提督
                    break;
                case 3:
                    medal.mark = "guard-3"  // 总督
                    break;
            }
        }
        if (msg.info[2][2]){
            identity = "admin"
        } else if (uid == this.uid)  {
            identity = "anchor"
        }
        let danmaku = {
            platform: "bilibili",
            type: "text",
            timestamp: date,
            data: {
                text: text,
                mode: mode,
                color: color,
                user: user,
                uid: uid,
                date: date,
                medal: medal,
                identity: identity,
            }
        }
        this.toChat(danmaku)
    }
    msg_ENTRY_EFFECT(msg) {      // 进入直播间特效
        let data = msg.data
        let labels = []
        switch (data.id) {
            case 4: // 舰长
            case 2: // 提督

        }
        let date = parseInt(data.trigger_time / 1000000)
        let text = data.copy_writing
        let user = text.match(/<%(.*?)%>/)
        let uid = data.uid
        let medal = undefined
        let entry = {
            platform: "bilibili",
            type: "entry_effect",
            timestamp: date,
            data: {
                text: text,
                user: user,
                uid: uid,
                date: date,
                medal: medal,
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
        switch (data.msg_type){
            case 1:
                type = "entry"  // 进入直播间
                break;
            case 2:
                type = "follow" // 关注直播间
                break;
            case 3:
                type = "share"  // 分享直播间
                break;
            default :
                type = "interact"   // 进行互动操作
        }
        let interact = {
            platform: "bilibili",
            type: type,
            timestamp: date,
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
        let date = data.timestamp
        let medal = null
        if (data.medal_info && data.medal_info.medal_level) {
            medal = {
                level: data.medal_info.medal_level,
                name: data.medal_info.medal_name,
                uid: data.medal_info.target_id,
            }
        }
        let gift = {
            platform: "bilibili",
            type: "gift",
            timestamp: date,
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

    }
    msg_ROOM_BLOCK_MSG(msg) {   // 禁言

    }
    bufGift(data, combo) {   // 将礼物信息放入缓冲池
        let buf = {
            gift: data,
            combo: combo,
            timer: setTimeout(()=>{}, 10000),
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
    async getGuardList() {  // 获取舰长列表
        let guardNumber = 0
        let pages = 0
        let guards = new Map()
        let guardDataTransform = function (guard) {
            let rank = guard.rank
            let uid = guard.uid
            let user = guard.username
            let level = guard.guard_level
            let medal = {
                level: guard.medal_info.medal_level,
                name: guard.medal_info.medal_name,
                uid: guard.ruid,
                mark: `guard-${guard.guard_level}`,
            }
            guards.set(guard.uid, {
                uid: uid,
                user: user,
                level: level,
                rank: rank,
                medal: medal,
            })
        }
        let getGuardsByPage = async (p) => {
            axios.get(`https://api.live.bilibili.com/xlive/app-room/v2/guardTab/topList?roomid=${this.roomid}&page=${p}&ruid=${this.uid}&page_size=29`)
            .then(res => {
                let data = res.data.data
                data.list.forEach(guardDataTransform)
            })
            .catch(error => {
                console.error(error)
            })
        }
        axios.get(`https://api.live.bilibili.com/xlive/app-room/v2/guardTab/topList?roomid=${this.roomid}&page=1&ruid=${this.uid}&page_size=29`)
        .then(res => {
            let data = res.data.data
            guardNumber = data.info.num
            pages = data.info.page
            data.top3.forEach(guardDataTransform)
            data.list.forEach(guardDataTransform)
        })
        .catch(error => {
            console.error(error)
        })
        let axiosTimeout = setTimeout(()=>{
            let i = 2
            let axiosInterval = setInterval(()=>{
                if (i > pages) {
                    clearInterval(axiosInterval)
                    clearTimeout(axiosTimeout)
                    console.log("bilibiliLive.js: 已获取全部舰长列表")
                    console.log(guards)
                    this.guards = guards
                    this.guardNumber = guardNumber
                } else {
                    getGuardsByPage(i)
                    i++
                }
            }, 200)
        }, 200)
    }
}

module.exports = bilibiliLive
