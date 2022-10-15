"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const ChatProcessor_1 = __importDefault(require("./Chat/ChatProcessor"));
const LiveRoomController_1 = __importDefault(require("./LiveRoom/LiveRoomController"));
class FloatingLiving extends events_1.EventEmitter {
    constructor({ rooms, opening }) {
        super();
        /** 拓展插件 */
        this.plugin = new Map();
        this.timestamp = new Date().valueOf();
        this.liveRoomController = new LiveRoomController_1.default({ rooms, opening });
        this.chatProcessor = new ChatProcessor_1.default();
        /** 从房间监听控制模块中获取并处理信息 */
        this.liveRoomController.on("msg", (msg) => {
            this.chatProcessor.process(msg);
            this.emit("msg", msg);
        });
        this.liveRoomController.on("origin", (msg) => {
            this.emit("origin", msg);
        });
    }
    /** 添加房间 */
    addRoom(r, open) {
        this.liveRoomController.addRoom(r, open);
    }
    /** 添加房间监听对象 */
    addLiveRoom(liveRoom, open) {
        this.liveRoomController.addLiveRoom(liveRoom, open);
    }
    /** 删除房间 */
    removeRoom(roomKey) {
        this.liveRoomController.removeRoom(roomKey);
    }
    /** 打开房间监听 */
    openRoom(roomKey) {
        this.liveRoomController.getRoom(roomKey)?.open();
    }
    /** 关闭房间监听 */
    closeRoom(roomKey) {
        this.liveRoomController.getRoom(roomKey)?.close();
    }
    /** 获取房间信息 */
    getRoomInfo(roomKey) {
        this.liveRoomController.getRoom(roomKey);
    }
    /** 更新房间信息 */
    async updateRoomInfo(roomKey) {
        return await this.liveRoomController.getRoom(roomKey)?.getInfo();
    }
    /** 添加插件 */
    addPlugin(name, pluginFunc) {
        let pluginObject = pluginFunc(this);
        this.plugin.set(name, pluginObject);
        return pluginObject;
    }
    /** 根据名称获取插件 */
    getPlugin(name) {
        this.plugin.get(name);
    }
    /** 移除插件 */
    removePlugin(name) {
        if (!this.plugin.has(name))
            return;
        let pluginObject = this.plugin.get(name);
        this.plugin.delete(name);
        pluginObject.destory && pluginObject.destory();
    }
}
exports.default = FloatingLiving;
