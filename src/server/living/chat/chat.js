const chatFilter = require("./chatFilter")
const chatCommand = require("./chatCommand")
const EventEmitter = require("events")

class chat {
    constructor() {
        this.event = new EventEmitter()
        this.filter = new chatFilter(filterList)
        this.filter.event.on("filter", (data) => {
            this.event.emit("filter", data)
        })
        this.command = new chatCommand(commandList)
        this.command.event.on("command", (data) => {
            this.event.emit("command", data)
        })
    }
    process(msg) {
        if (this.filter) this.filter.filter(msg)
        if (this.command) this.command.filter(msg)
        this.event.emit("msg", msg)
    }
    on(eventName, func) {
        this.event.on(eventName, func)
    }
}

/** 屏蔽列表
 * @property type 屏蔽词类型
 * @property name 屏蔽组名称
 * @property keyword 屏蔽关键词，当前仅支持纯文本屏蔽
 * @property mode 屏蔽模式，包括: hide-隐藏、block-屏蔽、replace-更换用词
 */
let filterList = [
    
]

/** 命令执行列表
 * @property command 命令类型
 * @property pattern 符合触发命令的正则表达式
 * @property callback 要执行的回调函数
 */
let commandList = [

]

module.exports = chat
