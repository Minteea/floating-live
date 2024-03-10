import { FloatingLive } from "../live";
import { FloatingEventMap } from "../types/events";

export abstract class BasePlugin {
  static pluginName: string;
  protected main: FloatingLive;
  private registerList: [string, string, (...args: any[]) => void][] = [];
  constructor(main: FloatingLive) {
    this.main = main;
  }
  /** 插件监听事件 */
  on<T extends keyof FloatingEventMap>(
    eventName: T,
    listener: FloatingEventMap[T]
  ) {
    this.main.on(eventName, listener);
    this.registerList.push(["event", eventName, listener]);
  }
  /** 插件一次性监听事件 */
  once<T extends keyof FloatingEventMap>(
    eventName: T,
    listener: FloatingEventMap[T]
  ) {
    this.main.once(eventName, listener);
    this.registerList.push(["event", eventName, listener]);
  }
  /** 插件移除监听事件 */
  off<T extends keyof FloatingEventMap>(
    eventName: T,
    listener: FloatingEventMap[T]
  ) {
    this.main.off(eventName, listener);
  }
  /** 插件发送事件 */
  emit<T extends keyof FloatingEventMap>(
    eventName: T,
    ...args: Parameters<FloatingEventMap[T]>
  ) {
    this.main.emit(eventName, ...args);
  }
  abstract destroy(): void;
}
