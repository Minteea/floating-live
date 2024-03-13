import { LiveRoom } from "../core/LiveRoom";

import { FloatingLive } from "../live";
import { Message } from "../types/message";
import { RoomStatus } from "../enums";
import { RoomDetail, RoomInfo, RoomStatsInfo } from "../types";

/** 直播间监听实例控制器 */
export class ModRoom {
  private map = new Map<string, LiveRoom>();
  readonly main: FloatingLive;

  constructor(main: FloatingLive) {
    this.main = main;
    const { command } = main;
    command.register("add", this.add.bind(this));
    command.register("remove", this.remove.bind(this));
    command.register("open", this.open.bind(this));
    command.register("close", this.close.bind(this));
    command.register("update", this.update.bind(this));
  }

  /** 添加房间监听实例 */
  public addRoom(room: LiveRoom, open?: boolean) {
    let key = room.key;
    if (this.map.has(key)) {
      this.main.throw({
        message: "房间已存在",
        id: "room:add_exist",
      });
      return;
    }
    this.map.set(key, room);
    // 添加监听事件
    // 直播消息
    room.on("message", (data: Message.All) => {
      const ctx = { message: data };
      this.main.hook.call("message", { message: data }).then((res) => {
        res && this.main.emit("live:message", ctx.message);
      });
    });
    // 直播消息源数据
    room.on(
      "raw",
      (
        data: any,
        { platform, room }: { platform: string; room: string | number }
      ) => {
        this.main.emit("live:raw", data, { platform, room });
      }
    );
    // 正在连接服务器
    room.on("connecting", () => {
      this.main.emit("room:connecting", key);
    });
    // 连接到服务器
    room.on("connected", () => {
      this.main.emit("room:connected", key);
    });
    // 与服务器的连接已断开
    room.on("disconnect", () => {
      this.main.emit("room:disconnect", key);
    });
    // 连接到直播间
    room.on("enter", () => {
      this.main.emit("room:enter", key);
    });
    // 获取房间信息
    room.on("info", () => {
      this.main.emit("room:info", key, room.info);
    });
    // 直播展示信息更改
    room.on("detail", (data: Partial<RoomDetail>) => {
      this.main.emit("room:detail", key, data);
    });
    // 直播状态更改
    room.on(
      "status",
      (
        status: RoomStatus,
        { id, timestamp }: { id?: string; timestamp: number }
      ) => {
        this.main.emit("room:status", key, { status, id, timestamp });
      }
    );
    // 统计数据更新
    room.on("stats", (data: Partial<RoomStatsInfo>) => {
      this.main.emit("room:stats", key, data);
    });
    // 房间被打开
    room.on("open", () => {
      this.main.emit("room:open", key, room.info);
    });
    // 房间被关闭
    room.on("close", () => {
      this.main.emit("room:close", key, room.info);
    });
    if (open) {
      room.open();
    }
    this.main.emit("room:add", key, room.info);
  }
  /** 添加房间 */
  public async add(
    platform: string,
    id: number,
    options?: boolean | Record<string, any>
  ) {
    const opt = typeof options == "boolean" ? { open: options } : options || {};
    const ctx = { platform, id, options: opt };
    const res = await this.main.hook.call("room.add", ctx);
    if (!res) {
      this.main.throw({ message: "无法添加房间", id: "room:add_fail" });
    }
    const room = await this.main.call(`${platform}.room.create`, id, opt);
    if (!room) {
      this.main.throw({ message: "无法创建房间", id: "room:create_fail" });
    } else {
      this.addRoom(room);
    }
  }
  /** 移除房间 */
  public remove(key: string) {
    let room = this.map.get(key);
    if (!room) {
      this.main.throw({
        message: "房间不存在",
        id: "room:remove_unexist",
      });
    }
    this.map.delete(key); // 从表中删除房间
    room?.removeAllListeners(); // 移除房间监听实例
    this.main.emit("room:remove", key);
  }
  /** 获取房间 */
  public get(key: string) {
    return this.map.get(key);
  }
  public has(key: string) {
    return this.map.has(key);
  }
  /** 获取房间信息 */
  public info(key: string) {
    let room = this.map.get(key);
    return room ? room.info : undefined;
  }
  /** 更新房间信息 */
  public update(key: string) {
    let room = this.map.get(key);
    room && room.getInfo();
  }
  /** 获取房间key列表 */
  get keys(): Array<string> {
    return [...this.map.keys()];
  }
  /** 获取房间列表 */
  getList(): Array<LiveRoom> {
    return [...this.map.values()];
  }
  /** 打开房间连接 */
  open(key: string) {
    let room = this.map.get(key);
    room?.available && !room.opened && room.open();
  }
  /** 关闭房间连接 */
  close(key: string) {
    let room = this.map.get(key);
    room?.opened && room.close();
  }
  /** 更改某个房间的顺序 */
  move(key: string, position: number) {
    const arr = [...this.map];
    const index = arr.findIndex(([k]) => k == key);
    if (index == -1) return;
    const [item] = arr.splice(index, 1);
    arr.splice(position, 0, item);
    this.map = new Map(arr);
    this.main.emit("room:move", key, position);
  }
  /** 获取快照 */
  getSnapshot() {
    return this.getList().map((room) => room.info);
  }
}
