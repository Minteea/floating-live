import { EventEmitter } from "events";
import { ModPlugin } from "./module/plugin";
import { ModRoom } from "./module/room";
import { ModManifest } from "./module/manifest";
import { ModCommand } from "./module/command";
import { ModValue } from "./module/value";
import { ModHook } from "./module/hook";
import { FloatingEventMap } from "./types/events";
import { ErrorOptions, FloatingCommandMap } from "./types";

export class FloatingLive extends EventEmitter {
  /** 房间控制模块 */
  public room: ModRoom;
  /** 插件处理模块 */
  public plugin: ModPlugin;
  /** 命令模块 */
  public command: ModCommand;
  /** Manifest模块 */
  public manifest: ModManifest;
  /** 数值模块 */
  public value: ModValue;
  /** 钩子模块 */
  public hook: ModHook;

  constructor() {
    super();
    this.command = new ModCommand(this);
    this.manifest = new ModManifest(this);
    this.plugin = new ModPlugin(this);
    this.room = new ModRoom(this);
    this.value = new ModValue(this);
    this.hook = new ModHook(this);
  }

  call<T extends keyof FloatingCommandMap>(
    name: T,
    ...args: Parameters<FloatingCommandMap[T]>
  ): ReturnType<FloatingCommandMap[T]> {
    return this.command.call(name, ...args);
  }

  on<T extends keyof FloatingEventMap>(
    eventName: T,
    listener: FloatingEventMap[T]
  ) {
    return super.on(eventName, listener);
  }

  emit<T extends keyof FloatingEventMap>(
    eventName: T,
    ...args: Parameters<FloatingEventMap[T]>
  ) {
    const emit = super.emit(eventName, ...args);
    super.emit("event", eventName, ...args);
    return emit;
  }

  /** 抛出错误 */
  throw(err: Error, options?: ErrorOptions): void;
  throw(options: ErrorOptions): void;
  throw(err: Error | ErrorOptions, options?: ErrorOptions): void {
    if (err instanceof Error) {
      throw Object.assign(err, options);
    } else {
      throw Object.assign(new Error(), err);
    }
  }

  getSnapshot() {
    return {
      room: this.room.getSnapshot(),
      value: this.value.getSnapshot(),
      manifest: this.manifest.getSnapshot(),
      command: this.command.getSnapshot(),
      hook: this.value.getSnapshot(),
    };
  }
}
