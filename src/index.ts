import { EventEmitter } from "events";
import { ModPlugin } from "./module/ModPlugin";
import { ModRoom } from "./module/ModRoom";
import { ModAuth } from "./module/ModAuth";
import { ModMessage } from "./module/ModMessage";
import { ModState } from "./module/ModState";
import ModCommand from "./module/ModCommand";

export class FloatingLive extends EventEmitter {
  /** 房间控制模块 */
  public room: ModRoom;
  /** 消息处理模块 */
  public message: ModMessage;
  /** 用户登录凭据模块 */
  public auth: ModAuth;
  /** 插件处理模块 */
  public plugin: ModPlugin<this>;
  /** 命令模块 */
  public command: ModCommand;
  /** 状态模块 */
  public state: ModState;
  /** 插件事件注册表 */
  private regEventMap = new Map<string, [string, (...args: any[]) => void][]>();

  constructor() {
    super();
    this.command = new ModCommand(this);
    this.state = new ModState(this);
    this.plugin = new ModPlugin(this);
    this.room = new ModRoom(this);
    this.message = new ModMessage(this);
    this.auth = new ModAuth(this);
    this.init();
  }

  /** 初始化 */
  private init() {
    // 设置在插件卸载时移除由插件注册的事件
    this.on("plugin:remove", (name: string) => {
      this.regEventMap.get(name)?.forEach(([eventName, listener]) => {
        this.removeListener(eventName, listener);
      });
    });
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

  emit(eventName: string | symbol, ...args: any[]): boolean {
    const result = super.emit(eventName, ...args);
    super.emit("event", eventName, ...args);
    return result;
  }
}
