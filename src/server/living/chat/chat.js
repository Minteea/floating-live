const chatFilter = require("./chatFilter")
const chatCommand = require("./chatCommand")
const EventEmitter = require("events")
let commandList = require("../../../config/server/chatCommandList.js")
let filterList = require("../../../config/server/chatFilterList.js")

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

module.exports = chat
