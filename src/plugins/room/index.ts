import { AppErrorLegacy } from "../../error";
import { LiveMessage } from "../../live/message";
import {
  LiveRoom,
  LiveRoomDetailInfo,
  LiveRoomData,
  LiveRoomStatsInfo,
  LiveRoomStatus,
  LiveRoomEventMap,
  InvalidLiveRoom,
} from "../../live/room";
import { BasePlugin } from "../../plugin";
import { PluginContext } from "../../plugin/types";
import { bindCommand } from "../../utils";

interface LiveRoomWithAbortController extends LiveRoom {
  [key: symbol]: AbortController;
}

interface PluginExposes {
  add(
    platform: string,
    id: number,
    options?: boolean | Record<string, any>,
  ): void;
  remove(key: string): void;
  get(key: string): LiveRoom | InvalidLiveRoom | undefined;
  has(key: string): boolean;
  data(key: string): LiveRoomData | undefined;
  update(key: string): void;
  open(key: string): void;
  close(key: string): void;
  getList(): (LiveRoom | InvalidLiveRoom)[];
}

declare module "../.." {
  interface AppCommandMap {
    add: (
      platform: string,
      id: number,
      options?: boolean | Record<string, any>,
    ) => void;
    remove: (key: string) => void;
    move: (key: string, position: number) => void;

    open: (key: string) => void;
    close: (key: string) => void;

    update: (key: string) => void;

    "room.snapshot": () => LiveRoomData[];

    [name: `${string}.room.create`]: (
      id: string | number,
      options: Record<string, any>,
    ) => LiveRoom | Promise<LiveRoom>;

    [name: `${string}.room.data`]: (
      id: string | number,
    ) => LiveRoomData | Promise<LiveRoomData>;
  }

  interface AppEventDetailMap {
    "live:message": { message: LiveMessage.All };
    "live:raw": {
      /** 平台 */
      platform: string;
      roomId: string | number;
      /** 服务来源 */
      service?: string;
      data: any;
    };

    "room:connecting": { key: string };
    "room:connected": { key: string };
    "room:disconnect": { key: string };
    "room:enter": { key: string };

    "room:add": { key: string; room: LiveRoomData };
    "room:remove": { key: string };
    "room:move": { key: string; position: number };

    "room:validate": { key: string; room: LiveRoomData };
    "room:invalidate": { key: string; room: LiveRoomData };

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
    "room.create": {
      serviceId: string;
      id: string | number;
      options: Record<string, any>;
    };
  }
  interface AppSnapshotMap {
    room: LiveRoomData[];
  }

  interface AppPluginExposesMap {
    room: PluginExposes;
  }
}

export class Room extends BasePlugin {
  static pluginName = "room";

  private map = new Map<string, LiveRoom | InvalidLiveRoom>();

  /** AbortController 属性 symbol
   * 与 room 插件实例绑定，为绑定的
   */
  private symbolAbortController = Symbol("room.abortController");

  init(ctx: PluginContext) {
    ctx.registerCommand("add", bindCommand(this.add, this));
    ctx.registerCommand("remove", bindCommand(this.remove, this));
    ctx.registerCommand("open", bindCommand(this.open, this));
    ctx.registerCommand("close", bindCommand(this.close, this));
    ctx.registerCommand("update", bindCommand(this.update, this));
    ctx.registerCommand("move", bindCommand(this.move, this));
    ctx.registerCommand("room.snapshot", bindCommand(this.toSnapshot, this));
  }

  expose(): PluginExposes {
    return {
      add: this.add.bind(this),
      remove: this.remove.bind(this),
      get: this.get.bind(this),
      has: this.has.bind(this),
      data: this.data.bind(this),
      update: this.update.bind(this),
      open: this.open.bind(this),
      close: this.close.bind(this),
      getList: this.getList.bind(this),
    };
  }

  /** 添加房间监听实例 */
  public attach(room: LiveRoom | InvalidLiveRoom, open?: boolean) {
    const key = room.key;
    if (this.map.has(key)) {
      this.throw(
        new AppErrorLegacy("room:add_exist", {
          message: "房间已存在",
        }),
      );
      return;
    }
    this.map.set(key, room);

    // 如果房间有效，则绑定事件
    if (room.valid) {
      this.bindEvent(room);

      if (open) {
        room.open();
      }
      this.ctx.emit("room:add", { key, room: room.toData() });
    }
  }

  /** 绑定房间事件监听 */
  private bindEvent(room: LiveRoom) {
    const key = room.key;
    const abortController = new AbortController();
    (room as LiveRoomWithAbortController)[this.symbolAbortController] =
      abortController;

    const setHandler = <K extends keyof LiveRoomEventMap>(
      type: K,
      listener: (e: LiveRoomEventMap[K]) => void,
    ) => {
      room.on(type, listener, abortController.signal);
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
  }

  /** 添加房间 */
  public async add(
    serviceId: string,
    id: number,
    options?: boolean | Record<string, any>,
  ) {
    const opt = typeof options == "boolean" ? { open: options } : options || {};

    const room = await this.create(serviceId, id, opt);

    this.attach(room);
  }

  /** 创建房间实例 */
  public async create(
    serviceId: string,
    id: number | string,
    options: Record<string, any> = {},
  ) {
    const ctx = { serviceId, id, options };
    const res = await this.ctx.callHook("room.create", ctx);
    if (res.defaultPrevented) {
      this.throw(
        new this.Error("room:add_hook_prevented", {
          message: "无法添加房间",
          cause: "房间添加被钩子函数阻止",
          target: `room/${serviceId}:${id}`,
        }),
      );
    }
    let room: LiveRoom | InvalidLiveRoom;
    try {
      room = await this.ctx.call(`${serviceId}.room.create`, id, options);
    } catch (e: any) {
      if (options.allowInvalidRoom) {
        room = new InvalidLiveRoom(serviceId, id);
      } else {
        this.throw(
          new this.Error("room:create_fail", {
            message: "无法创建房间",
            cause: e,
            target: `room/${serviceId}:${id}`,
          }),
        );
      }
    }
    return room;
  }

  /** 移除房间 */
  public remove(key: string) {
    let room = this.map.get(key) as LiveRoomWithAbortController;
    if (!room) {
      this.throw(
        new this.Error("room:remove_unexist", {
          message: "房间不存在",
          target: `room/${key}`,
        }),
      );
    }
    this.map.delete(key); // 从表中删除房间

    // 移除插件实例对该房间的所有监听
    room[this.symbolAbortController]?.abort();
    (room as any)[this.symbolAbortController] = undefined;

    this.ctx.emit("room:remove", { key });
  }
  /** 激活无效房间 */
  public async validate(key: string, options: Record<string, any>) {
    let invalidRoom = this.map.get(key);
    if (!invalidRoom) {
      throw new Error(`找不到房间: ${key}`);
    }
    if (invalidRoom.valid == true) {
      throw new Error(`无法激活有效房间: ${key}`);
    }
    const { serviceId, id } = invalidRoom;
    const room = await this.create(serviceId, id, options);
    this.map.set(key, room);

    if (room.valid) {
      this.ctx.emit("room:validate", { key, room: room.toData() });
    }
  }

  /** 使房间无效 */
  public invalidate(key: string) {
    // let invalidRoom = this.map.get(key);
    // if (!invalidRoom) {
    //   throw new Error(`找不到房间: ${key}`);
    // }
    // if (invalidRoom.valid == true) {
    //   throw new Error(`无法激活有效房间: ${key}`);
    // }
    // const { serviceId, id } = invalidRoom;
    // const room = await this.create(serviceId, id, options);
    // this.map.set(key, room);
    // if (room.valid) {
    //   this.ctx.emit("room:validate", { key, room: room.toData() });
    // }
  }

  /** 获取房间 */
  public get(key: string) {
    return this.map.get(key);
  }
  public has(key: string) {
    return this.map.has(key);
  }
  /** 获取房间信息 */
  public data(key: string) {
    let room = this.map.get(key);
    return room ? room.toData() : undefined;
  }
  /** 更新房间信息 */
  public update(key: string) {
    let room = this.map.get(key);
    room && room.valid && room.update();
  }
  /** 获取房间key列表 */
  get keys() {
    return [...this.map.keys()];
  }
  /** 获取房间列表 */
  getList() {
    return [...this.map.values()];
  }
  /** 打开房间连接 */
  open(key: string) {
    let room = this.map.get(key);
    if (!room) {
      this.throw(
        new this.Error("room:open_unexist", {
          message: "要打开的房间不存在",
          target: `room/${key}`,
        }),
      );
    }
    if (!room.valid) {
      this.throw(
        new this.Error("room:open_invalid", {
          message: "要打开的房间无效",
          target: `room/${key}`,
        }),
      );
    }
    room!.open();
  }
  /** 关闭房间连接 */
  close(key: string) {
    let room = this.map.get(key);
    if (!room) {
      this.throw(
        new this.Error("room:close_unexist", {
          message: "关闭的房间不存在",
          target: `room/${key}`,
        }),
      );
    }
    if (!room.valid) {
      this.throw(
        new this.Error("room:close_invalid", {
          message: "要关闭的房间无效",
          target: `room/${key}`,
        }),
      );
    }
    room!.close();
  }
  /** 更改某个房间的顺序 */
  move(key: string, position: number) {
    const arr = [...this.map];
    const index = arr.findIndex(([k]) => k == key);
    if (index == -1) {
      this.throw(
        new this.Error("room:move_unexist", {
          message: "要移动的房间不存在",
          target: `room/${key}`,
        }),
      );
    }
    const [item] = arr.splice(index, 1);
    arr.splice(position, 0, item);
    this.map = new Map(arr);
    this.ctx.emit("room:move", { key, position });
  }
  /** 获取快照 */
  toSnapshot(): LiveRoomData[] {
    return this.getList().map((room) => room.toData());
  }
}

export default Room;
