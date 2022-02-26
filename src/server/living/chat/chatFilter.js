const { EventEmitter } = require("events")

class chatFilter {
    constructor(filterList) {
        this.filterList = filterList
        this.event = new EventEmitter()
    }
    filter(chat) {
        if (chat.type == "text") {
            let text = chat.data.text
            let filterList = this.filterList
            fgroup: for (let g = 0; g < filterList.length; g++) {
                let group = filterList[g]
                if (group.open) {
                    for (let i = 0; i < group.keyword.length; i++) {
                        if (text.includes(group.keyword[i])) {
                            let keyword = group.keyword[i]
                            chat.filter = {
                                type: group.type,
                                name: group.name,
                                keyword: keyword,
                                mode: group.mode,
                            }
                            switch (group.mode) {
                                case "hide": {
                                    chat.filter.reason = group.reason
                                    chat.filter.showUser = group.showUser
                                    break
                                }
                                case "block": {
                                    chat.filter.keyword = keyword
                                    chat.block = true
                                    break
                                }
                                case "replace": {
                                    chat.filter.replace = group.replace
                                    chat.showText = group.replace
                                    break
                                }
                            }
                            this.event.emit("filter", chat)
                            break fgroup
                        }
                    }
                }
            }
        }
    }
}

module.exports = chatFilter
