import { EventEmitter } from "events";
import getRoomInfo from "./utils/getRoomInfo";
import { Registerable } from "./lib/Registerable";
import LiveRoom from "./types/room/LiveRoom";
import { MessageType } from "./types/message/MessageData";
import Controller from "./controller";

class FloatingLive extends EventEmitter {
  /** 控制器 */
  public controller: Controller
  /** 拓展插件 */
  public plugin: Map<string, { [key: string]: any }> = new Map();
  public helper = {
    /** 房间生成器 */
    roomGenerator: new Registerable<(id: string | number, open?: boolean) => {key: string, room: LiveRoom}>("roomGenerator"),
    /** 消息处理 */
    messageHandler: new Registerable<(msg: MessageType) => void>("messageHandler"),
  }
  constructor() {
    super();
    this.controller = new Controller(this)
  }
  /** 添加插件 */
  public registerPlugin(name: string, pluginFunc: (main: FloatingLive) => any) {
    Registerable.currentPlugin = name;
    let pluginObject = pluginFunc(this);  // 获取插件操作对象
    this.plugin.set(name, pluginObject);
    this.emit("addPlugin", name);
    console.log(`已添加插件: ${name}`)
    Registerable.currentPlugin = null;
    return pluginObject;
  }
  /** 根据名称获取插件操作对象 */
  public getPlugin(name: string) {
    return this.plugin.get(name);
  }
  /** 移除插件 */
  public removePlugin(name: string) {
    if (!this.plugin.has(name)) {
      this.emit("pluginUnexist", name);
      return;
    }
    let pluginObject = this.plugin.get(name);
    this.plugin.delete(name);
    this.helper.roomGenerator.unregister(name)
    this.helper.messageHandler.unregister(name)
    pluginObject?.destory && pluginObject.destory();
    this.emit("removePlugin", name);
  }
}
export default FloatingLive;
