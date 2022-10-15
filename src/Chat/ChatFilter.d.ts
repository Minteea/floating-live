import MessageData from "../Message/MessageData";
import ChatProcessor from "./ChatProcessor";
declare class ChatFilter {
    chatProcessor: ChatProcessor;
    filterList: any[];
    constructor(chatProcessor: ChatProcessor, filterList: any[]);
    process(msg: MessageData): void;
}
export default ChatFilter;
