/// <reference types="node" />
import MedalInfo from "../Message/Info/MedalInfo";
import UserInfo from "../Message/Info/UserInfo";
import LiveRoom from "../liveroom/LiveRoom";
import { EventEmitter } from "events";
declare class acfunLive extends EventEmitter implements LiveRoom {
    /** 平台id */
    readonly platform: string;
    /** 房间id */
    readonly id: number;
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
    client: any;
    /** 是否为持续监听状态 */
    opening: boolean;
    constructor(id: number, open?: boolean);
    getInfo(): Promise<void>;
    /** 开启直播间监听 */
    open(): Promise<void>;
    /** 连接直播服务端 */
    createWS(): Promise<void>;
    close(): void;
    destory(): void;
    /** 根据守护徽章字符串获取粉丝牌信息 */
    getMedal(badge: string): MedalInfo | null;
    /** 文本信息(danmaku) */
    msg_danmaku(data: {
        sendTimeMs: string;
        userInfo: {
            userIdentity: any;
            badge: string;
            nickname: any;
            userId: string;
        };
        content: any;
    }): void;
    /** 礼物信息(gift) */
    msg_gift(data: {
        sendTimeMs: string;
        userInfo: {
            userIdentity: any;
            badge: string;
            nickname: any;
            userId: string;
        };
        giftName: any;
        giftId: string;
        count: any;
        value: string;
    }): void;
    /** 互动信息 */
    msg_interact(data: {
        sendTimeMs: string;
        userInfo: {
            userIdentity: any;
            badge: string;
            nickname: any;
            userId: string;
        };
    }, type: "entry" | "like" | "follow" | "share" | "join"): void;
    msg_live_info(data: any): void;
    emitMsg(data: any): void;
    emitOrigin(data: any): void;
    initOrigin(): void;
}
export default acfunLive;
