const bilibiliLive = require("./platform/bilibiliLive.js")
const acfunLive = require("./platform/acfunLive.js")
const fs = require("fs")

const id = 254992
const platform = "bilibili"
const date = Number(new Date())
const dateObj = new Date(date)
const fileName = `${dateObj.getFullYear()}${(dateObj.getMonth() + 1).toString().padStart(2, '0')}${dateObj.getDate().toString().padStart(2, '0')}_${dateObj.getHours().toString().padStart(2, '0')}${dateObj.getMinutes().toString().padStart(2, '0')}${dateObj.getSeconds().toString().padStart(2, '0')}-${id}`

function chatHandler(message) {
    console.log(message)
    fs.writeFile(`./save/${fileName}.txt`, (JSON.stringify(message) + ','), { encoding: 'utf8', flag: 'a' }, err => {
        if (err) throw err;
        console.log('写入成功');
    })
}

function giftHandler(message) {
    console.log(message)
    fs.writeFile(`./save/${fileName}-gift.txt`, (JSON.stringify(message) + ','), { encoding: 'utf8', flag: 'a' }, err => {
        if (err) throw err;
        console.log('写入成功');
    })
}

function testHandler(message) {
    fs.writeFile(`./save/${fileName}-test.txt`, (JSON.stringify(message) + ','), { encoding: 'utf8', flag: 'a' }, err => {
        if (err) throw err;
    })
}

class living {
    constructor() {
        switch (platform.toLowerCase()) {
            case "bilibili":
                this.live_bili = new bilibiliLive(id, { chat: chatHandler, gift: giftHandler, test: testHandler })
                break
            case "acfun":
                this.live_acfun = new acfunLive(id, { chat: chatHandler, gift: giftHandler, test: testHandler })
                break
            default:
                console.log("living: 未找到相应直播平台")
        }
    }
}

module.exports = living
