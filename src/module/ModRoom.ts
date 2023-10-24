import { Reglist } from "../core/Reglist";
import { LiveRoom } from "../core/LiveRoom";

import { FloatingLive } from "../live";
import { Message } from "../types/message";
import { RoomStatus } from "../enums";
import { RoomDetail, RoomInfo, RoomStatsInfo } from "../types";

/** 直播间监听实例控制器 */
export class ModRoom {
  readonly main: FloatingLive;
  private roomMap: Map<string, LiveRoom> = new Map();
  private auths: Map<string, string> = new Map();
  private configs: Map<string, object> = new Map();

  public generator: Reglist<
    (id: string | number, open?: boolean, config?: object) => LiveRoom
  >;

  constructor(main: FloatingLive) {
    this.main = main;
    this.generator = new Reglist(this.main, "room.generator");
    this.main.state.register("room", () => {
      const list: RoomInfo[] = [];
      this.roomMap.forEach((room) => {
        list.push(room.info);
      });
      return { list };
    });
    this.main.command.batchRegister({
      add: (platform, id, open) => {
        this.add(platform, id, open);
      },
      remove: (key) => {
        this.remove(key);
      },
      open: (key) => {
        this.open(key);
      },
      close: (key) => {
        this.close(key);
      },
      update: (key) => {
        this.update(key);
      },
    });
  }

  /** 设置房间配置 */
  public setConfig(platform: string, config: any) {
    this.configs.set(platform, config);
  }

  /** 生成房间 */
  public generate(platform: string, id: string | number, open?: boolean) {
    platform = platform.toLowerCase();
    const config = this.configs.get(platform) || {};
    const auth = this.auths.get(platform);
    let platformGenerator = this.generator.get(platform);
    if (platformGenerator) {
      return platformGenerator(id, open, { auth, ...config });
    } else {
      this.main.emit("room:unknown_platform", platform);
    }
  }
  /** 添加房间监听实例 */
  public addRoom(room: LiveRoom, open?: boolean) {
    let key = room.key;
    if (this.roomMap.has(key)) {
      this.main.emit("room:exist", key);
      return;
    }
    this.roomMap.set(key, room);
    // 添加监听事件
    // 直播消息
    room.on("msg", (data: Message.All) => {
      this.main.message.handle(data);
      this.main.emit("live:message", data);
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
    // 连接到直播间
    room.on("connect", () => {
      this.main.emit("room:connect", key);
    });
    // 与直播间的连接已断开
    room.on("disconnect", () => {
      this.main.emit("room:disconnect", key);
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
        this.main.emit("room:status", key, status, { id, timestamp });
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
  public add(platform: string, id: number, open: boolean) {
    const room = this.generate(platform, id, open);
    room && this.addRoom(room);
  }
  /** 移除房间 */
  public remove(roomKey: string) {
    if (!this.roomMap.has(roomKey)) {
      this.main.emit("room:unexist", roomKey);
      return;
    }
    let room = this.roomMap.get(roomKey);
    this.roomMap.delete(roomKey); // 从表中删除房间
    room?.removeAllListeners(); // 移除房间监听实例
    this.main.emit("room:remove", roomKey);
  }
  /** 获取房间 */
  public get(roomKey: string) {
    return this.roomMap.get(roomKey);
  }
  /** 获取房间信息 */
  public info(roomKey: string) {
    let room = this.roomMap.get(roomKey);
    return room ? room.info : undefined;
  }
  /** 更新房间信息 */
  public update(roomKey: string) {
    let room = this.roomMap.get(roomKey);
    room && room.getInfo();
  }
  /** 获取roomKey列表 */
  get keys(): Array<string> {
    return [...this.roomMap.keys()];
  }
  /** 打开房间连接 */
  open(roomKey: string) {
    let room = this.roomMap.get(roomKey);
    room?.available && !room.opened && room.open();
  }
  /** 关闭房间连接 */
  close(roomKey: string) {
    let room = this.roomMap.get(roomKey);
    room?.opened && room.close();
  }
}
