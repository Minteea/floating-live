"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ChatFilter {
    constructor(chatProcessor, filterList) {
        this.chatProcessor = chatProcessor;
        this.filterList = filterList;
    }
    process(msg) {
        if (msg.type == "text" && msg.info.text) {
            let text = msg.info.text;
            let filterList = this.filterList;
            fgroup: for (let g = 0; g < filterList.length; g++) {
                let group = filterList[g];
                if (group.open) {
                    for (let i = 0; i < group.keyword.length; i++) {
                        if (text.includes(group.keyword[i])) {
                            let keyword = group.keyword[i];
                            msg.block = {
                                type: group.type,
                                name: group.name,
                                keyword: keyword,
                                mode: group.mode,
                            };
                            switch (group.mode) {
                                case "hide": {
                                    msg.block.reason = group.reason;
                                    break;
                                }
                                case "replace": {
                                    msg.block.reason = group.reason;
                                    msg.block.replace = group.replace;
                                    break;
                                }
                            }
                            this.chatProcessor.emit("filter", msg);
                            break fgroup;
                        }
                    }
                }
            }
        }
    }
}
exports.default = ChatFilter;
