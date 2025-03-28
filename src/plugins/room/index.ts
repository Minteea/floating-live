import { AppError } from "../../error";
import { LiveMessage } from "../../live/message";
import {
  LiveRoom,
  LiveRoomDetailInfo,
  LiveRoomData,
  LiveRoomStatsInfo,
  LiveRoomStatus,
  LiveRoomEventMap,
} from "../../live/room";
import { BasePlugin } from "../../plugin";
import { PluginContext } from "../../plugin/types";
import { bindCommand } from "../../utils";

interface MessageEventDetail {
  message: any;
}

interface RoomEventDetail {
  key: string;
  status?: number;
  anchor?: any;
  detail?: any;
}

declare module "../.." {
  interface AppCommandMap {
    add: (
      platform: string,
      id: number,
      options?: boolean | Record<string, any>
    ) => void;
    remove: (key: string) => void;
    move: (key: string, position: number) => void;

    open: (key: string) => void;
    close: (key: string) => void;

    update: (key: string) => void;

    "room.snapshot": () => LiveRoomData[];

    [name: `${string}.room.create`]: (
      id: string | number,
      options: Record<string, any>
    ) => LiveRoom | Promise<LiveRoom>;
  }

  interface AppEventDetailMap {
    "live:message": { message: LiveMessage.All };
    "live:raw": {
      platform: string;
      roomId: string | number;
      data: any;
    };

    "room:connecting": { key: string };
    "room:connected": { key: string };
    "room:disconnect": { key: string };
    "room:enter": { key: string };

    "room:add": { key: string; room: LiveRoomData };
    "room:remove": { key: string };
    "room:move": { key: string; position: number };

    "room:open": { key: string; room: LiveRoomData };
    "room:close": { key: string; room: LiveRoomData };

    "room:update": { key: string; room: LiveRoomData };
    "room:detail": { key: string; detail: LiveRoomDetailInfo };
    "room:stats": { key: string; stats: LiveRoomStatsInfo };
    "room:status": {
      key: string;
      status: LiveRoomStatus;
      liveId?: string | number;
      timestamp: number;
    };
  }
  interface AppHookMap {
    "live.message": { message: LiveMessage.All };
    "room.add": {
      platform: string;
      id: string | number;
      options: Record<string, any>;
    };
  }
}

export class Room extends BasePlugin {
  static pluginName = "room";
  private map = new Map<string, LiveRoom>();

  private symbolRoomEventHandlers = Symbol("room.roomEventHandlers");

  constructor(ctx: PluginContext) {
    super(ctx);
    ctx.registerCommand("add", bindCommand(this.add, this));
    ctx.registerCommand("remove", bindCommand(this.remove, this));
    ctx.registerCommand("open", bindCommand(this.open, this));
    ctx.registerCommand("close", bindCommand(this.close, this));
    ctx.registerCommand("update", bindCommand(this.update, this));
    ctx.registerCommand("room.snapshot", bindCommand(this.getSnapshot, this));
  }

  /** 添加房间监听实例 */
  public attachRoom(room: LiveRoom, open?: boolean) {
    let key = room.key;
    if (this.map.has(key)) {
      this.ctx.throw(
        new AppError("room:add_exist", {
          message: "房间已存在",
        })
      );
      return;
    }
    this.map.set(key, room);

    const eventHandlers: [string, (e: any) => void][] = [];
    (room as any)[this.symbolRoomEventHandlers] = eventHandlers;

    const setHandler = <K extends keyof LiveRoomEventMap>(
      type: K,
      listener: (e: LiveRoomEventMap[K]) => void
    ) => {
      room.on(type, listener);
      eventHandlers.push([type, listener]);
    };

    // 添加监听事件
    // 直播消息
    setHandler("message", ({ message }) => {
      const ctx = { message };
      this.ctx.callHook("live.message", ctx).then((ctx) => {
        !ctx.defaultPrevented &&
          this.ctx.emit("live:message", { message: ctx.message });
      });
    });
    // 直播消息源数据
    setHandler("raw", ({ platform, roomId, data }) => {
      this.ctx.emit("live:raw", { platform, roomId, data });
    });
    // 正在连接服务器
    setHandler("connecting", () => {
      this.ctx.emit("room:connecting", { key });
    });
    // 连接到服务器
    setHandler("connected", () => {
      this.ctx.emit("room:connected", { key });
    });
    // 与服务器的连接已断开
    setHandler("disconnect", () => {
      this.ctx.emit("room:disconnect", { key });
    });
    // 连接到直播间
    setHandler("enter", () => {
      this.ctx.emit("room:enter", { key });
    });
    // 获取房间信息
    setHandler("update", () => {
      this.ctx.emit("room:update", { key, room: room.toData() });
    });
    // 直播展示信息更改
    setHandler("detail", ({ detail }) => {
      this.ctx.emit("room:detail", { key, detail });
    });
    // 直播状态更改
    setHandler("status", ({ liveId, timestamp, status }) => {
      this.ctx.emit("room:status", { key, status, liveId, timestamp });
    });
    // 统计数据更新
    setHandler("stats", ({ stats }) => {
      this.ctx.emit("room:stats", { key, stats });
    });
    // 房间被打开
    setHandler("open", () => {
      this.ctx.emit("room:open", { key, room: room.toData() });
    });
    // 房间被关闭
    setHandler("close", () => {
      this.ctx.emit("room:close", { key, room: room.toData() });
    });

    if (open) {
      room.open();
    }
    this.ctx.emit("room:add", { key, room: room.toData() });
  }
  /** 添加房间 */
  public async add(
    platform: string,
    id: number,
    options?: boolean | Record<string, any>
  ) {
    const opt = typeof options == "boolean" ? { open: options } : options || {};
    const ctx = { platform, id, options: opt };
    const res = await this.ctx.callHook("room.add", ctx);
    if (!res.defaultPrevented) {
      this.ctx.throw(
        this.ctx.error("room:add_fail", { message: "无法添加房间" })
      );
    }
    const room = await this.ctx.call(`${platform}.room.create`, id, opt);
    if (!room) {
      this.ctx.throw(
        this.ctx.error("room:create_fail", { message: "无法创建房间" })
      );
    } else {
      this.attachRoom(room);
    }
  }
  /** 移除房间 */
  public remove(key: string) {
    let room = this.map.get(key);
    if (!room) {
      this.ctx.throw(
        this.ctx.error("room:remove_unexist", {
          message: "房间不存在",
        })
      );
    }
    this.map.delete(key); // 从表中删除房间

    (room as any)[this.symbolRoomEventHandlers].forEach(
      ([type, listener]: [string, (e: any) => void]) => {
        room?.removeEventListener(type, listener);
      }
    ); // 移除房间监听实例
    this.ctx.emit("room:remove", { key });
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
    return room ? room.toData() : undefined;
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
    this.ctx.emit("room:move", { key, position });
  }
  /** 获取快照 */
  getSnapshot() {
    return this.getList().map((room) => room.toData());
  }
}

export default Room;
