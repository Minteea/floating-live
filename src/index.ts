import { EventEmitter } from "events";
import { Reglist } from "./abstract/Reglist";
import { LiveRoom } from "./abstract/LiveRoom";
import { Message } from "./types";
import { ModPlugin } from "./module/ModPlugin";
import { ModRooms } from "./module/ModRooms";
import { ModAuth } from "./module/ModAuth";
import { ModMessage } from "./module/ModMessage";

export class FloatingLive extends EventEmitter {
  /** 房间控制模块 */
  public rooms: ModRooms;
  /** 消息处理模块 */
  public message: ModMessage;
  /** 用户登录凭据模块 */
  public auth: ModAuth;
  /** 插件处理模块 */
  public plugin: ModPlugin<this>;
  public helper: {
    /** 消息处理 */
    messageHandler: Reglist<(msg: Message.All) => void>;
    /** 插件销毁 */
    pluginDestory: Reglist<() => void>;
    /** 添加插件 */
    pluginAddHandler: Reglist<(name: string) => void>;
    /** 移除插件 */
    pluginRemoveHandler: Reglist<(name: string) => void>;
  };
  /** 插件事件注册表 */
  private regEventMap = new Map<string, [string, (...args: any[]) => void][]>();

  constructor() {
    super();
    this.helper = {
      messageHandler: new Reglist(this, "messageHandler"),
      pluginDestory: new Reglist(this, "pluginDestory"),
      pluginAddHandler: new Reglist(this, "pluginAddHandler"),
      pluginRemoveHandler: new Reglist(this, "pluginRemoveHandler"),
    };
    this.rooms = new ModRooms(this);
    this.message = new ModMessage(this);
    this.auth = new ModAuth(this);
    this.plugin = new ModPlugin(this);
    this.init();
  }

  /** 初始化 */
  private init() {
    // 设置在插件卸载时移除由插件注册的事件
    this.helper.pluginRemoveHandler.register(
      "removePluginEvent",
      (name: string) => {
        this.regEventMap.get(name)?.forEach(([eventName, listener]) => {
          this.removeListener(eventName, listener);
        });
      }
    );
  }

  /** 重写事件监听 */
  on(eventName: string, listener: (...args: any[]) => void) {
    super.on(eventName, listener);
    // 检测是否为插件添加事件，并添加进事件列表
    if (this.plugin.currentPlugin) {
      if (!this.regEventMap.has(this.plugin.currentPlugin)) {
        this.regEventMap.set(this.plugin.currentPlugin, []);
      }
      this.regEventMap
        .get(this.plugin.currentPlugin)
        ?.push([eventName, listener]);
    }
    return this;
  }
}
