import { FloatingLive } from "../..";
import { UserInfo } from "../../src/types/message/AttributeInfo";
import { MessageData } from "../../src/types/message/MessageData";

export class chatPrint {
  /** 主模块 */
  main: FloatingLive
  hideType: Set<string>;
  constructor(main: FloatingLive) {
    this.main = main
    let hidden: any[] = [];
    this.hideType = new Set(hidden); // 隐藏类型

    this.main.on("live_message", (msg) => {this.log(msg)})
  }
  /** 获取用户信息 */
  public getUserInfo(message: {platform: string, info: {user: UserInfo}}) {
    let user = message.info.user  // 用户信息
    let name = `${"\x1b[33m"}${user.name}` // 用户名
    let medal = user.medal ? `${"\x1b[32m"}[${user.medal.name}(${user.medal.level})] ` : "" // 粉丝牌
    let membership = user.membership ? `${"\x1b[36m"}[${this.getPriviliegeName(message.platform, user.membership)}]` : ""  // 特权粉丝
    let identity = user.identity ? `${"\x1b[95m"}[${{admin: "房管", anchor: "主播"}[user.identity]}]` : ""  // 房管

    return `${medal}${membership}${identity}${name}${"\x1b[0m"}`  //[粉丝牌(等级)] [特权][房管]用户名
  }
  /** 获取特权粉丝名称 */
  public getPriviliegeName(platform: string, level: number | boolean) {
    switch (platform) {
      case "bilibili":
        return `${"\x1b[36m"}${["", "总督", "提督", "舰长"][Number(level)]}`;
      default: 
        return level
    }
  }
  /** 记录在控制台上 */
  log(message: MessageData) {
    if (this.hideType.has(message.type)) {
      return;
    }
    switch (message.type) {
      case "chat": {
        let user = this.getUserInfo(message)
        let content = message.info.content
        console.log(`${user}: ${message.info.image ? "[img]" : ""}${content}`)
        break;
      }
      case "like": {
        let user = this.getUserInfo(message)
        console.log(`${user} 点赞了`)
        break;
      }
      case "gift": {
        let user = this.getUserInfo(message)
        let action = message.info.gift.action || "送出"
        let name = message.info.gift.name
        let num = message.info.gift.num
        console.log(`${user}${"\x1b[0m"} ${action} ${"\x1b[40;33m"}${name} x${num}${"\x1b[0m"}`);
        break;
      }
      case "membership": {
        let user = this.getUserInfo(message)
        let name = message.info.name
        console.log(
          `${user}${"\x1b[1;31m"} 开通了主播的${"\x1b[33m"}${name}${"\x1b[0m"}`
        );
        break;
      }
      case "superchat": {
        let user = this.getUserInfo(message)
        let second = Math.round(message.info.duration / 1000)
        console.log(
          `${"\x1b[1;36m"}SC(${second}s) ${user}${"\x1b[0m"}: ${message.info.text}`
        );
        break;
      }
      case "entry": {
        let user = this.getUserInfo(message)
        console.log(
          `${user} 进入直播间`
        );
        break;
      }
      case "follow": {
        let user = this.getUserInfo(message)
        console.log(
          `${user} 关注了主播`
        );
        break;
      }
      case "share": {
        let user = this.getUserInfo(message)
        console.log(
          `${user} 分享了直播间`
        );
        break;
      }
      case "block": {
        let user = this.getUserInfo(message)
        let operator = message.info.operator.identity ? {admin: "房管", anchor: "主播"}[message.info.operator.identity] : "管理员"
        console.log(
          `${user} 已被${operator}禁言`
        );
        break;
      }
      case "live_start": {
        let roomKey = `${message.platform}:${message.room}`
        console.log(
          `[+] 直播间${"\x1b[40;33m"} ${roomKey} ${"\x1b[0m"}已开播`
        );
        break;
      }
      case "live_cut": {
        let roomKey = `${message.platform}:${message.room}`
        let msg = message.info.message
        console.log(
          `[!] ${"\x1b[1;31m"}直播间${"\x1b[40;33m"} ${roomKey} ${"\x1b[1;31m"}被管理员切断${"\x1b[0m"}: ${msg}`
        );
        break;
      }
      case "live_end": {
        let roomKey = `${message.platform}:${message.room}`
        console.log(
          `[=] ${"\x1b[1;31m"}直播间${"\x1b[40;33m"} ${roomKey} ${"\x1b[1;31m"}已结束直播${"\x1b[0m"}`
        );
      }
    }
  }
}
