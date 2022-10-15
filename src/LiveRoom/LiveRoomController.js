"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const LiveRoomGenerator_1 = __importDefault(require("./LiveRoomGenerator"));
/** 直播间监听实例控制器 */
class LiveRoomController extends events_1.EventEmitter {
    constructor({ rooms, opening }) {
        super();
        /** 房间表 */
        this.roomMap = new Map();
        this.liveRoomGenerator = new LiveRoomGenerator_1.default();
        rooms?.forEach((r) => {
            this.addRoom(r, opening || false);
        });
    }
    /** 打开所有房间的消息获取 */
    openAll() {
        this.roomMap.forEach((room) => {
            room.open();
        });
    }
    /** 关闭所有房间的消息获取 */
    closeAll() {
        this.roomMap.forEach((room) => {
            room.close();
        });
    }
    /** 添加房间 */
    addRoom(r, open) {
        let keyRoom = this.liveRoomGenerator.generate(r, open);
        if (!keyRoom)
            return;
        let { key, room } = keyRoom;
        if (this.roomMap.has(key)) {
            console.log(`[LiveRoomController] 房间已存在: ${key}`);
            return;
        }
        this.roomMap.set(key, room);
        room.on("msg", (data) => {
            this.emit("msg", data);
        });
        room.on("origin", (data) => {
            this.emit("origin", data);
        });
        console.log(`[LiveRoomController] 已添加房间: ${key}`);
    }
    /** 添加房间监听对象 */
    addLiveRoom(room, open) {
        let roomKey = `${room.platform}:${room.id}`;
        if (this.roomMap.has(roomKey)) {
            console.log(`[LiveRoomController] 房间已存在: ${roomKey}`);
            return;
        }
        this.roomMap.set(roomKey, room);
        room.on("msg", (data) => {
            this.emit("msg", data);
        });
        if (open) {
            room.open();
        }
    }
    /** 移除房间 */
    removeRoom(roomKey) {
        if (!this.roomMap.has(roomKey)) {
            console.log(`[LiveRoomController] 房间不存在: ${roomKey}:`);
            return;
        }
        let room = this.roomMap.get(roomKey);
        this.roomMap.delete(roomKey); // 从表中删除房间
        room?.destory(); // 销毁房间监听实例
        console.log(`[LiveRoomController] 已移除房间: ${roomKey}:`);
    }
    /** 获取房间 */
    getRoom(r) {
        let roomKey = typeof r == "object" ? this.roomKey(r) : r;
        return this.roomMap.get(roomKey);
    }
    /** 根据房间平台及id拼接为roomKey(房间标识符) */
    roomKey({ platform, id, }) {
        return `${platform}:${id}`;
    }
    /** 根据roomKey获取房间平台及id */
    roomKeyInfo(roomKey) {
        let arr = roomKey.split(":");
        return { platform: arr[0], id: arr[1] };
    }
    /** 获取roomList属性: 房间列表 */
    get roomList() {
        return [...this.roomMap.keys()];
    }
}
exports.default = LiveRoomController;
