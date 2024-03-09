import { LiveRoom } from "../core/LiveRoom";

import { FloatingLive } from "../live";
import { Message } from "../types/message";
import { RoomStatus } from "../enums";
import { RoomDetail, RoomInfo, RoomStatsInfo } from "../types";

/** 直播间监听实例控制器 */
export class ModRoom {
  private list = new Map<string, LiveRoom>();
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
    if (this.list.has(key)) {
      this.main.throw(
        Object.assign(new Error("房间已存在"), {
          from: "room",
          signal: "room_exist",
        })
      );
      return;
    }
    this.list.set(key, room);
    // 添加监听事件
    // 直播消息
    room.on("msg", (data: Message.All) => {
      this.main.hook.call("message", data).then((res) => {
        res && this.main.emit("live:message", data);
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
    // 连接到服务器
    room.on("connect", () => {
      this.main.emit("room:connect", key);
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
  public add(
    platform: string,
    id: number,
    config?: boolean | Record<string, any>
  ) {
    if (typeof config == "boolean") {
      config = { open: config };
    }
    const room = this.main.call(`${platform}.room.create`, id, config);
    room && this.addRoom(room);
  }
  /** 移除房间 */
  public remove(roomKey: string) {
    let room = this.list.get(roomKey);
    if (!room) {
      this.main.throw(
        Object.assign(new Error("房间不存在"), {
          from: "room",
          signal: "room_unexist",
        })
      );
    }
    this.list.delete(roomKey); // 从表中删除房间
    room?.removeAllListeners(); // 移除房间监听实例
    this.main.emit("room:remove", roomKey);
  }
  /** 获取房间 */
  public get(roomKey: string) {
    return this.list.get(roomKey);
  }
  /** 获取房间信息 */
  public info(roomKey: string) {
    let room = this.list.get(roomKey);
    return room ? room.info : undefined;
  }
  /** 更新房间信息 */
  public update(roomKey: string) {
    let room = this.list.get(roomKey);
    room && room.getInfo();
  }
  /** 获取roomKey列表 */
  get keys(): Array<string> {
    return [...this.list.keys()];
  }
  /** 打开房间连接 */
  open(roomKey: string) {
    let room = this.list.get(roomKey);
    room?.available && !room.opened && room.open();
  }
  /** 关闭房间连接 */
  close(roomKey: string) {
    let room = this.list.get(roomKey);
    room?.opened && room.close();
  }
  /** 更改某个房间的顺序 */
  move(roomKey: string, position: number) {
    const arr = [...this.list];
    const index = arr.findIndex(([key]) => key == roomKey);
    if (index == -1) return;
    const [item] = arr.splice(index, 1);
    arr.splice(position, 0, item);
    this.list = new Map(arr);
  }
  /** 获取快照 */
  getSnapshot() {
    return [...this.list].map(([key, room]) => room.info);
  }
}
