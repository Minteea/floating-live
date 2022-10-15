/// <reference types="node" />
import ChatFilter from "./ChatFilter";
import ChatCommand from "./ChatCommand";
import { EventEmitter } from "events";
import MessageData from "../Message/MessageData";
declare class ChatProcessor extends EventEmitter {
    filter: ChatFilter;
    command: ChatCommand;
    constructor();
    process(msg: MessageData): void;
}
export default ChatProcessor;
