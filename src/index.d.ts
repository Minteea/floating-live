/// <reference types="node" />
import { EventEmitter } from "events";
import ChatProcessor from "./Chat/ChatProcessor";
import LiveRoom from "./LiveRoom/LiveRoom";
import LiveRoomController from "./LiveRoom/LiveRoomController";
declare class FloatingLiving extends EventEmitter {
    /** 房间监听控制模块 */
    liveRoomController: LiveRoomController;
    /** 聊天消息处理模块 */
    chatProcessor: ChatProcessor;
    /** 拓展插件 */
    plugin: Map<string, any>;
    /** 时间戳 */
    timestamp: number;
    constructor({ rooms, opening }: {
        rooms?: Array<string | {
            platform: string;
            id: string | number;
        }>;
        opening?: boolean;
    });
    /** 添加房间 */
    addRoom(r: string | {
        platform: string;
        id: string | number;
    }, open?: boolean): void;
    /** 添加房间监听对象 */
    addLiveRoom(liveRoom: LiveRoom, open?: boolean): void;
    /** 删除房间 */
    removeRoom(roomKey: string): void;
    /** 打开房间监听 */
    openRoom(roomKey: string): void;
    /** 关闭房间监听 */
    closeRoom(roomKey: string): void;
    /** 获取房间信息 */
    getRoomInfo(roomKey: string): void;
    /** 更新房间信息 */
    updateRoomInfo(roomKey: string): Promise<any>;
    /** 添加插件 */
    addPlugin(name: string, pluginFunc: (main: FloatingLiving) => any): any;
    /** 根据名称获取插件 */
    getPlugin(name: string): void;
    /** 移除插件 */
    removePlugin(name: string): void;
}
export default FloatingLiving;
