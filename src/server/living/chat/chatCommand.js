const { EventEmitter } = require("events")

class chatCommand {
    constructor(filterList) {
        this.filterList = filterList
        this.event = new EventEmitter()
    }
    filter(chat) {
        if (chat.type == "text" && !chat.filter) {
            let text = chat.data.text
            let filterList = this.filterList
            for (let g = 0; g < filterList.length; g++) {
                let rule = filterList[g]
                if (rule.pattern.test(text)) {
                    let command = {
                        platform: chat.platform,
                        type: "command",
                        command: rule.command,
                        timestamp: chat.timestamp,
                        info: {
                            type: "text",
                            user: chat.data.user,
                            uid: chat.data.uid,
                        },
                        data: {},
                    }
                    if (rule.callback) {
                        rule.callback(chat, command, rule.pattern)
                    }
                    chat.command = {
                        command: command.command,
                        data: command.data
                    }
                    this.event.emit("command", command)
                }
            }
        }
    }
}

module.exports = chatCommand
