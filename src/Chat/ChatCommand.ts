import MessageData from "../Message/MessageData"
import ChatProcessor from "./ChatProcessor"

class ChatCommand {
    chatProcessor: ChatProcessor
    filterList: any[]
    constructor(chatProcessor: ChatProcessor, filterList: any[]) {
        this.chatProcessor = chatProcessor
        this.filterList = filterList
    }
    process(msg: MessageData) {
        if (msg.type == "text" && !msg.block) {
            let text = msg.info.text
            let filterList = this.filterList
            for (let g = 0; g < filterList.length; g++) {
                let rule = filterList[g]
                if (rule.pattern.test(text)) {
                    let command = {
                        platform: msg.platform,
                        type: "command",
                        command: rule.command,
                        timestamp: msg.local_timestamp,
                        info: {
                            type: "text",
                            user: msg.info.user,
                        },
                        data: {},
                    }
                    if (rule.callback) {
                        rule.callback(msg, command, rule.pattern)
                    }
                    msg.command = {
                        command: command.command,
                        data: command.data
                    }
                    this.chatProcessor.emit("command", command)
                }
            }
        }
    }
}

export default ChatCommand
