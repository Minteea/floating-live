import RoomInfo from "./RoomInfo";

interface LiveRoom extends RoomInfo {
  /** 直播平台 */
  readonly platform: string;
  /** 房间id */
  readonly id: number;
  /** 打开连接 */
  open: () => void;
  /** 关闭连接 */
  close: () => void;
  /** 销毁 */
  destory: () => void;
  /** 从服务器获取信息 */
  getInfo: () => void;
  /** 事件监听 */
  on: (eventName: string | symbol, listener: (...args: any[]) => void) => this;
  /** 移除事件监听 */
  removeAllListeners: () => void;
}

export default LiveRoom;
