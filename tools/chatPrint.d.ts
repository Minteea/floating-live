import FloatingLiving from "..";
import UserInfo from "../src/Message/Info/UserInfo";
import { MessageType } from "../src/Message/MessageInterface";
declare class chatPrint {
    /** 主模块 */
    main: FloatingLiving;
    hideType: Set<string>;
    constructor(main: FloatingLiving);
    /** 获取用户信息 */
    getUserInfo(message: {
        platform: string;
        info: {
            user: UserInfo;
        };
    }): string;
    /** 获取特权粉丝名称 */
    getPriviliegeName(platform: string, level: number | boolean): string | number | boolean;
    /** 记录在控制台上 */
    log(message: MessageType): void;
}
export default chatPrint;
