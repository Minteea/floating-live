import LiveRoom from "./LiveRoom";
declare type PlatformGenerator = (id: string | number, open?: boolean) => {
    key: string;
    room: LiveRoom;
};
/** 直播间监听实例生成器 */
declare class LiveRoomGenerator {
    private generatorMap;
    constructor();
    /** 生成一个房间 */
    generate(r: string | {
        platform: string;
        id: string | number;
    }, open?: boolean): {
        key: string;
        room: LiveRoom;
    } | undefined;
    addPlatform(platform: string, generator: PlatformGenerator): void;
}
export default LiveRoomGenerator;
