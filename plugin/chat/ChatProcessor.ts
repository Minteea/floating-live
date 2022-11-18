import ChatFilter from "./ChatFilter";
import ChatCommand from "./ChatCommand";
import { EventEmitter } from "events";
import { MessageData } from "../../src/types/message/MessageData";
let commandList: any[] = []
let filterList: any[] = []

class ChatProcessor extends EventEmitter {
  filter: ChatFilter;
  command: ChatCommand;
  constructor() {
    super();
    this.filter = new ChatFilter(this, filterList);
    this.command = new ChatCommand(this, commandList);
  }
  process(msg: MessageData) {
    if (this.filter) this.filter.process(msg);
    if (this.command) this.command.process(msg);
  }
}

export default ChatProcessor;
