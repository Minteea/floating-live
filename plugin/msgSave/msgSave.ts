import { RoomStatus } from "../..";
import fs from "fs-extra";
import { FloatingLive } from "../..";
import path from "path";

function getTimeStr(timestamp: number) {
  let startDate = new Date(timestamp);
  return `${startDate.getFullYear()}${(startDate.getMonth() + 1)
    .toString()
    .padStart(2, "0")}${startDate
    .getDate()
    .toString()
    .padStart(2, "0")}_${startDate
    .getHours()
    .toString()
    .padStart(2, "0")}${startDate
    .getMinutes()
    .toString()
    .padStart(2, "0")}${startDate.getSeconds().toString().padStart(2, "0")}`;
}
/** 获取当次记录状态
 * S=直播开始 L=直播中 E=直播结束 O=未开播
 */
function getRecordStatus(status?: RoomStatus, statusChanged?: boolean) {
  if (status == RoomStatus.live) {
    /** 已开播 */
    return statusChanged ? "S" : "L";
  } else {
    /** 未开播 */
    return statusChanged ? "E" : "O";
  }
}

interface SaveInfoConfig {
  platform: string;
  room: string | number;
  status: RoomStatus;
  timestamp: number;
  statusChanged: boolean;
}

class SaveInfo implements SaveInfoConfig {
  /** 文件id */
  get fileId() {
    return `${this.platform}_${this.room}-${getTimeStr(this.timestamp || 0)}${
      this.sliceByStatus ? getRecordStatus(this.status, this.statusChanged) : ""
    }${this.part ? `.${this.part}` : ""}`;
  }
  /** 平台 */
  platform: string;
  /** 房间号 */
  room: string | number;
  /** 时间戳 */
  timestamp: number;
  /** 状态 */
  status: RoomStatus;
  /** 文件是否存在 */
  exist: boolean = false;
  /** 记录状态是否已更改 */
  statusChanged: boolean = false;
  /** 按状态分文件 */
  sliceByStatus: boolean;
  /** 消息记录数 */
  count: number = 0;
  /** 总消息记录数 */
  totalCount: number = 0;
  /** 按消息记录数分文件 */
  sliceByCount: number;
  /** 分块id */
  part: number;
  constructor({
    platform,
    room,
    status,
    timestamp,
    statusChanged,
    sliceByStatus = false,
    sliceByCount = 0,
  }: SaveInfoConfig & { sliceByStatus?: boolean; sliceByCount?: number }) {
    this.platform = platform;
    this.room = room;
    this.status = status;
    this.timestamp = timestamp;
    this.statusChanged = statusChanged;
    this.sliceByStatus = sliceByStatus;
    this.sliceByCount = sliceByCount;
    this.part = sliceByCount && 1;
  }
  /** 分块 */
  slice() {
    this.exist = false;
    this.count = 0;
    this.part += 1;
  }
}

class MsgSave {
  /** 主模块 */
  main: FloatingLive;
  /** 文件路径 */
  path: string;
  /** 前缀 */
  prefix: string;
  /** 后缀 */
  suffix: string;
  /** 按状态分文件 */
  sliceByStatus: boolean;
  sliceByCount: number;
  paused: boolean;
  /** 列表 */
  list: Map<string, SaveInfo> = new Map();
  constructor(
    main: FloatingLive,
    {
      filePath,
      prefix = "",
      suffix = "",
      open = true,
      sliceByStatus = false,
      sliceByCount = 0,
    }: {
      filePath: string;
      prefix?: string;
      suffix?: string;
      open?: boolean;
      sliceByStatus?: boolean;
      sliceByCount?: number;
    }
  ) {
    this.paused = !open;
    this.main = main;
    this.path = filePath;
    this.prefix = prefix;
    this.suffix = suffix;
    this.sliceByStatus = sliceByStatus;
    this.sliceByCount = sliceByCount;
  }
  write(
    message: any,
    { platform, room }: { platform: string; room: string | number }
  ) {
    if (this.paused) return;
    const roomKey = `${platform}:${room}`;
    // 获取保存信息，若信息不存在，则设置一个信息
    const saveInfo =
      this.list.get(roomKey) || this.createSaveInfo({ platform, room });
    // 若文件不存在，则创建一个有record_info信息的.floatrec文件
    if (!saveInfo.exist) this.createFile(roomKey);
    const file = path.join(
      this.path,
      `${this.prefix}${saveInfo.fileId}${this.suffix}.floatrec`
    );
    fs.writeFile(
      file,
      JSON.stringify(message) + ",",
      { encoding: "utf8", flag: "a" },
      (err) => {
        if (err) throw err;
        // console.log('写入成功');
      }
    );
    // 保存信息递增
    saveInfo.count += 1;
    // 若单文件保存信息已达最大值，则切分到下一个文件
    if (saveInfo.sliceByCount && saveInfo.sliceByCount <= saveInfo.count)
      saveInfo.slice();
  }
  start() {
    this.paused = false;
  }
  pause() {
    this.paused = true;
  }
  /** 设置保存信息 */
  setSaveInfo({
    platform,
    room,
    status,
    timestamp,
    statusChanged,
  }: SaveInfoConfig) {
    const saveInfo = new SaveInfo({
      platform,
      room,
      status,
      timestamp,
      statusChanged,
      sliceByStatus: this.sliceByStatus,
      sliceByCount: this.sliceByCount,
    });
    const roomKey = `${platform}:${room}`;
    if (this.list.get(roomKey)?.fileId == saveInfo.fileId) return;
    this.list.set(roomKey, saveInfo);
  }
  /** 创建保存信息，用于记录信息可能不存在的情况 */
  createSaveInfo({
    platform,
    room,
  }: {
    platform: string;
    room: string | number;
  }) {
    const { status, timestamp } = this.main.room.get(`${platform}:${room}`)
      ?.info || { status: RoomStatus.off, timestamp: 0 };
    const saveInfoConfig = {
      platform,
      room,
      status,
      timestamp,
      statusChanged: false,
      sliceByStatus: this.sliceByStatus,
      sliceByCount: this.sliceByCount,
    };
    this.setSaveInfo(saveInfoConfig);
    return this.list.get(`${platform}:${room}`)!;
  }
  /** 创建记录文件 */
  createFile(roomKey: string) {
    const saveInfo = this.list.get(roomKey)!;
    const file = path.join(
      this.path,
      `${this.prefix}${saveInfo.fileId}${this.suffix}.floatrec`
    );
    // 如果文件已存在，则将文件标记为已存在，否则创建一个文件并写入record_info信息
    if (fs.existsSync(file)) {
      saveInfo.exist = true;
      return;
    }
    fs.ensureFileSync(file);
    const message = {
      type: "record_info",
      platform: saveInfo.platform,
      room: saveInfo.room,
      timestamp: saveInfo.timestamp,
      statusChanged: saveInfo.statusChanged,
      index: saveInfo.totalCount,
      part: saveInfo.part,
      roomInfo: this.main.room.get(roomKey)?.info,
    };
    fs.writeFileSync(file, JSON.stringify(message) + ",", {
      encoding: "utf8",
      flag: "a",
    });
  }
  /** 移除记录信息 */
  removeSaveInfo(roomKey: string) {
    this.list.delete(roomKey);
  }
}

export default MsgSave;
