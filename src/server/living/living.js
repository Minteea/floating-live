const bilibiliLive = require("./platform/bilibiliLive.js")
const acfunLive = require("./platform/acfunLive.js")
const chat = require("./chat/chat.js")
const fs = require("fs")
const { EventEmitter } = require("events")
const msgSave = require("./tool/msgSave.js")
const chatPrint = require("./tool/chatPrint.js")

const id = 12607506//254992
const platform = "bilibili"
const date = Number(new Date())
const dateObj = new Date(date)
const fileName = `${dateObj.getFullYear()}${(dateObj.getMonth() + 1).toString().padStart(2, '0')}${dateObj.getDate().toString().padStart(2, '0')}_${dateObj.getHours().toString().padStart(2, '0')}${dateObj.getMinutes().toString().padStart(2, '0')}${dateObj.getSeconds().toString().padStart(2, '0')}-${id}`

class living {
    constructor() {
        this.event = new EventEmitter()     // 事件对象
        this.chat = new chat()              // 消息互动处理对象
        this.chatPrint = new chatPrint()    // 消息打印实例
        this.save = {
            msg: new msgSave(`./save/${fileName}.txt`),             // 消息记录保存实例
            gift: new msgSave(`./save/${fileName}-gift.txt`),       // 礼物记录保存实例
            command: new msgSave(`./save/${fileName}-cmd.txt`),     // 命令记录保存实例
            origin: new msgSave(`./save/${fileName}-origin.txt`),   // 源信息记录保存实例
        }
        this.start()    // 创建平台live消息处理实例

        this.chat.on('command', this.cmdHandler.bind(this))     // 监听命令消息
    }
    start() {
        switch (platform.toLowerCase()) {
            case "bilibili": {
                this.live_bilibili = new bilibiliLive(id)
                this.liveEvent(this.live_bilibili)
                break
            }
            case "acfun": {
                this.live_acfun = new acfunLive(id)
                this.liveEvent(this.live_acfun)
                break
            }
            default: {
                console.log("living: 未找到相应直播平台")
            }
        }
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
