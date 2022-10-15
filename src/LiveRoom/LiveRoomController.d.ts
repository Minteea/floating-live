/// <reference types="node" />
import LiveRoom from "./LiveRoom";
import { EventEmitter } from "events";
import LiveRoomGenerator from "./LiveRoomGenerator";
/** 直播间监听实例控制器 */
declare class LiveRoomController extends EventEmitter {
    /** 房间表 */
    roomMap: Map<string, LiveRoom>;
    liveRoomGenerator: LiveRoomGenerator;
    constructor({ rooms, opening }: {
        rooms?: Array<string | {
            platform: string;
            id: string | number;
        }>;
        opening?: boolean;
    });
    /** 打开所有房间的消息获取 */
    openAll(): void;
    /** 关闭所有房间的消息获取 */
    closeAll(): void;
    /** 添加房间 */
    addRoom(r: string | {
        platform: string;
        id: string | number;
    }, open?: boolean): void;
    /** 添加房间监听对象 */
    addLiveRoom(room: LiveRoom, open?: boolean): void;
    /** 移除房间 */
    removeRoom(roomKey: string): void;
    /** 获取房间 */
    getRoom(r: string | {
        platform: string;
        id: string | number;
    }): LiveRoom | undefined;
    /** 根据房间平台及id拼接为roomKey(房间标识符) */
    roomKey({ platform, id, }: {
        platform: string;
        id: string | number;
    }): string;
    /** 根据roomKey获取房间平台及id */
    roomKeyInfo(roomKey: string): {
        platform: string;
        id: string | number;
    };
    /** 获取roomList属性: 房间列表 */
    get roomList(): Array<string>;
}
export default LiveRoomController;
