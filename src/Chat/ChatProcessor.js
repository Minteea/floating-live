"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ChatFilter_1 = __importDefault(require("./ChatFilter"));
const ChatCommand_1 = __importDefault(require("./ChatCommand"));
const events_1 = require("events");
let commandList = [];
let filterList = [];
class ChatProcessor extends events_1.EventEmitter {
    constructor() {
        super();
        this.filter = new ChatFilter_1.default(this, filterList);
        this.command = new ChatCommand_1.default(this, commandList);
    }
    process(msg) {
        if (this.filter)
            this.filter.process(msg);
        if (this.command)
            this.command.process(msg);
    }
}
exports.default = ChatProcessor;
