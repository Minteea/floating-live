import { EventEmitter } from "events";
import { ModPlugin } from "./module/plugin";
import { ModRoom } from "./module/room";
import { ModStore } from "./module/store";
import ModCommand from "./module/command";
import { ModValues } from "./module/values";
import { ModHook } from "./module/hook";
import { FloatingEventMap } from "./types/events";

export class FloatingLive extends EventEmitter {
  /** 房间控制模块 */
  public room: ModRoom;
  /** 插件处理模块 */
  public plugin: ModPlugin;
  /** 命令模块 */
  public command: ModCommand;
  /** 状态模块 */
  public store: ModStore;
  /** 数值模块 */
  public values: ModValues;
  /** 数值模块 */
  public hook: ModHook;

  constructor() {
    super();
    this.command = new ModCommand(this);
    this.store = new ModStore(this);
    this.plugin = new ModPlugin(this);
    this.room = new ModRoom(this);
    this.values = new ModValues(this);
    this.hook = new ModHook(this);
  }

  call(name: string, ...args: any[]) {
    return this.command.call(name, ...args);
  }

  on<T extends keyof FloatingEventMap>(
    eventName: T,
    listener: FloatingEventMap[T]
  ) {
    return super.on(eventName, listener);
  }

  emit<T extends keyof FloatingEventMap>(eventName: T, ...args: any[]) {
    return super.emit(eventName, ...args);
  }

  throw(err: Error) {
    this.emit("error", err);
  }
}
