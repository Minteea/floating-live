/// <reference types="node" />
import UserInfo from "../Message/Info/UserInfo";
import { LiveWS } from "bilibili-live-ws";
import { EventEmitter } from "events";
import LiveRoom from "../LiveRoom/LiveRoom";
declare class bilibiliLive extends EventEmitter implements LiveRoom {
    /** 平台id */
    readonly platform: string;
    /** 直播间号 */
    readonly id: number;
    /** 直播间room_id */
    roomid: number;
    /** 直播标题 */
    title: string;
    /** 分区 */
    area: string[];
    /** 封面url */
    cover: string;
    /** 主播信息 */
    anchor: UserInfo;
    /** 是否持续保持连接 */
    readonly keep_connection: boolean;
    /** 是否正在直播 */
    living: boolean;
    /** 开始直播时间 */
    start_time: number;
    /** 直播间是否被封禁 */
    banned: boolean;
    /** 直播间弹幕api模块 */
    client: LiveWS | null;
    /** 是否为持续监听状态 */
    opening: boolean;
    constructor(id: number, open?: boolean);
    /** 获取房间信息 */
    getInfo(): Promise<void>;
    /** 开启直播间监听 */
    open(): Promise<void>;
    /** 连接直播服务端 */
    createWS(): Promise<void>;
    close(): void;
    destory(): void;
    emitMsg(data: any): void;
    emitOrigin(data: any): void;
    getDanmakuMode(n: number): string;
    /** 获取弹幕消息 */
    msg_DANMU_MSG(msg: any): void;
    /** 获取互动消息 */
    msg_INTERACT_WORD(msg: any): void;
    /** 获取礼物消息 */
    msg_SEND_GIFT(msg: any): void;
    /** 获取舰长开通消息 */
    msg_GUARD_BUY(msg: any): void;
    /** 获取醒目留言消息 */
    msg_SUPER_CHAT_MESSAGE(msg: any): void;
    msg_ROOM_BLOCK_MSG(msg: any): void;
    msg_LIVE(msg: any): void;
    msg_CUT_OFF(msg: any): void;
}
export default bilibiliLive;
