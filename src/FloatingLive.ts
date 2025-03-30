import { LiveRoom } from ".";
import { App } from "./app";
import { Room } from "./plugins/room";

export class FloatingLive extends App {
  room: Room;
  constructor() {
    super();
    this.room = this.registerSync(Room, { core: true });
  }
  /** 添加房间 */
  add(platform: string, id: number, options?: boolean | Record<string, any>) {
    return this.room.add(platform, id, options);
  }
  /** 移除房间 */
  remove(key: string) {
    return this.room.remove(key);
  }
  /** 获取房间 */
  get(key: string) {
    return this.room.get(key);
  }
  has(key: string) {
    return this.room.has(key);
  }
  /** 获取房间信息 */
  data(key: string) {
    return this.room.data(key);
  }
  /** 更新房间信息 */
  update(key: string) {
    return this.room.update(key);
  }
  /** 打开房间连接 */
  open(key: string) {
    return this.room.open(key);
  }
  /** 关闭房间连接 */
  close(key: string) {
    return this.room.close(key);
  }
  /** 获取房间列表 */
  getList() {
    return this.room.getList();
  }
}
