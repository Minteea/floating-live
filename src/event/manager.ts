import { App } from "../app";

export class EventManager {
  constructor(app: App) {}
  private registerMap = new Map<string, string>();
  private generalRegisterSet = new Set<string>();
  register(eventName: string, pluginName: string) {
    if (this.registerMap.has(eventName)) throw new Error("事件名已注册");
    this.registerMap.set(eventName, pluginName);
  }
  unregister(eventName: string) {
    this.registerMap.delete(eventName);
  }
  has(eventName: string) {
    return this.registerMap.has(eventName);
  }
}
