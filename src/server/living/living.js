const bilibiliLive = require("./platform/bilibiliLive.js")
const acfunLive = require("./platform/acfunLive.js")
const chat = require("./chat/chat.js")
const { EventEmitter } = require("events")
const msgSave = require("./tool/msgSave.js")
const chatPrint = require("./tool/chatPrint.js")

let liveId = false

class living {
    constructor(roomList, config = {}) {
        this.roomList = roomList
        let startDate = new Date()
        let fileName = `${startDate.getFullYear()}${(startDate.getMonth() + 1).toString().padStart(2, '0')}${startDate.getDate().toString().padStart(2, '0')}_${startDate.getHours().toString().padStart(2, '0')}${startDate.getMinutes().toString().padStart(2, '0')}${startDate.getSeconds().toString().padStart(2, '0')}-${liveId ? liveId : roomList[0].id}`
        this.roomMap = new Map()
        this.event = new EventEmitter()     // 事件对象
        this.chat = new chat()              // 消息互动处理对象
        this.chatPrint = new chatPrint()    // 消息打印实例
        this.save = {
            msg: new msgSave(`./save/${fileName}.txt`),             // 消息记录保存实例
            gift: new msgSave(`./save/${fileName}-gift.txt`),       // 礼物记录保存实例
            command: new msgSave(`./save/${fileName}-cmd.txt`),     // 命令记录保存实例
            origin: new msgSave(`./save/${fileName}-origin.txt`),   // 源信息记录保存实例
        }
        this.chat.on('command', this.cmdHandler.bind(this))     // 监听命令消息

        this.roomList.forEach(room => {
            this.newRoom(room)    // 创建平台live消息处理实例
        })
    }
    newRoom(room) {
        let liveRoom = null
        room.key = `${room.platform}-${room.id}`
        if (!this.roomMap.has(room.key)) {
            switch (room.platform) {
                case "bilibili": {
                    console.log(`living: 增加直播间: ${room.key}`)
                    liveRoom = new bilibiliLive(room.id)
                    break
                }
                case "acfun": {
                    console.log(`living: 增加直播间: ${room.key}`)
                    liveRoom = new acfunLive(room.id)
                    break
                }
                default: {
                    console.log(`living: 未找到相应直播平台: ${room.key}`)
                }
            }
            if (liveRoom) {
                this.roomMap.set(`${room.key}`, liveRoom)
                this.liveEvent(liveRoom)
            }
        } else {
            console.log(`living: 直播间已存在: ${room.key}`)
        }
    }
    addRoom(room) {
        switch (typeof room) {
            case "string": 
            let reg = /([0-9a-zA-z]+)-([0-9]+)/
                if (reg.test(room)) {
                    room.replace(reg, (match, platform, id)=>{
                        console.log(match)
                        this.newRoom({
                            platform: platform.toLowerCase(),
                            id: parseInt(id),
                        })
                    })
                } else {
                    console.log("living: 无法添加房间: 不正确的房间格式")
                }
                break
            case "object": 
                this.newRoom(room)
                break
            default:
                console.log("living: 无法添加房间: 不支持的数据类型")
        }
    }
    removeRoom(roomKey) {
        let room = this.roomMap.get(roomKey)
        room.close()    // 关闭连接
        this.roomMap.delete(roomKey)    // 在Map中删除对象
        console.log(`living: 删除直播间: ${roomKey}`)
    }
    liveEvent(live) {
        live.on('msg', this.msgHandler.bind(this))      // 监听一般消息，交由msgHandler处理

        live.on('gift', this.giftHandler.bind(this))       // 监听礼物信息并保存，测试用
        live.on('origin', this.originHandler.bind(this))   // 监听源信息并保存，测试用
    }
    on(eventName, func) {
        this.event.on(eventName, func)
    }
    msgHandler(msg) {               // 处理一般消息
        this.chat.process(msg)      // 由chat模块的process方法进行同步加工处理
        this.chatPrint.log(msg)     // 打印至console
        this.save.msg.write(msg)                // 保存至本地
        if (!msg.block) {
            this.event.emit('message', msg)     // 传输一般消息
        }
    }
    giftHandler(gift) {
        this.save.gift.write(gift)            // 保存至本地
    }
    originHandler(msg) {
        this.save.origin.write(msg)            // 保存至本地
    }
    cmdHandler(command) {           // 处理命令消息
        this.save.command.write(command)            // 保存至本地
        this.event.emit('command', command)     // 传输命令消息
    }
}

module.exports = living
