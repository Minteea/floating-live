const bilibiliLive = require("./platform/bilibiliLive.js")
const acfunLive = require("./platform/acfunLive.js")
const chat = require("./chat/chat.js")
const fs = require("fs")
const { EventEmitter } = require("events")

const id = 22445644 //254992
const platform = "bilibili"
const date = Number(new Date())
const dateObj = new Date(date)
const fileName = `${dateObj.getFullYear()}${(dateObj.getMonth() + 1).toString().padStart(2, '0')}${dateObj.getDate().toString().padStart(2, '0')}_${dateObj.getHours().toString().padStart(2, '0')}${dateObj.getMinutes().toString().padStart(2, '0')}${dateObj.getSeconds().toString().padStart(2, '0')}-${id}`

function chatPrint(message) {
    switch (message.type) {
        case "text": {
            if (message.data.medal) {
                medal = `[${message.data.medal.name}(${message.data.medal.level})] `
            } else {
                medal = ""
            }
            console.log(`${"\033[40;32m"}${medal}${"\033[40;33m"}${message.data.user}${"\033[0m"}: ${message.data.text}`)
            break
        }
        case "like": {
            if (message.data.medal) {
                medal = `[${message.data.medal.name}(${message.data.medal.level})] `
            } else {
                medal = ""
            }
            console.log(`${"\033[40;32m"}${medal}${"\033[40;33m"}${message.data.user}${"\033[0m"} 点赞了`)
            break
        }
        case "gift": {
            if (message.data.medal) {
                medal = `[${message.data.medal.name}(${message.data.medal.level})] `
            } else {
                medal = ""
            }
            console.log(`${"\033[40;32m"}${medal}${"\033[40;33m"}${message.data.user}${"\033[0m"} 投喂 ${"\033[40;33m"}${message.data.name} x${message.data.num}${"\033[0m"}`)
            break
        }
        case "entry": {
            if (message.data.medal) {
                medal = `[${message.data.medal.name}(${message.data.medal.level})] `
            } else {
                medal = ""
            }
            console.log(`${"\033[40;32m"}${medal}${"\033[40;33m"}${message.data.user}${"\033[0m"} 进入直播间`)
            break
        }
    }
}

function msgSave(message) {
    //console.log(message)
    fs.writeFile(`./save/${fileName}.txt`, (JSON.stringify(message) + ','), { encoding: 'utf8', flag: 'a' }, err => {
        if (err) throw err;
        //console.log('写入成功');
    })
}

function giftSave(message) {
    fs.writeFile(`./save/${fileName}-gift.txt`, (JSON.stringify(message) + ','), { encoding: 'utf8', flag: 'a' }, err => {
        if (err) throw err;
        //console.log('写入成功');
    })
}

function originSave(message) {
    fs.writeFile(`./save/${fileName}-origin.txt`, (JSON.stringify(message) + ','), { encoding: 'utf8', flag: 'a' }, err => {
        if (err) throw err;
    })
}

function cmdSave(message) {
    console.log(message)
    fs.writeFile(`./save/${fileName}-cmd.txt`, (JSON.stringify(message) + ','), { encoding: 'utf8', flag: 'a' }, err => {
        if (err) throw err;
    })
}

class living {
    constructor() {
        this.event = new EventEmitter()     // 事件对象
        this.chat = new chat()              // 消息互动处理对象
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

        live.on('gift', giftSave)       // 监听礼物信息并保存，测试用
        live.on('origin', originSave)   // 监听源信息并保存，测试用
    }
    on(eventName, func) {
        this.event.on(eventName, func)
    }
    msgHandler(msg) {               // 处理一般消息
        this.chat.process(msg)      // 由chat模块的process方法进行同步加工处理
        chatPrint(msg)              // 打印至console
        msgSave(msg)                // 保存至本地
        if (!msg.block) {
            this.event.emit('message', msg)     // 传输一般消息
        }
    }
    cmdHandler(command) {           // 处理命令消息
        cmdSave(command)            // 保存至本地
        this.event.emit('command', command)         // 传输命令消息
    }
}

module.exports = living
