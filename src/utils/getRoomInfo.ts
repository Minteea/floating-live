import LiveRoom from "../types/room/LiveRoom";
import RoomInfo from "../types/room/RoomInfo";

/** 从房间中获取房间信息 */
export default function getRoomInfo(liveroom: LiveRoom): RoomInfo {
  let {
    platform,
    id,
    live: {
      title,
      cover,
      area,
      status,
      start_time,
    },
    anchor,
    available,
    opening,
  } = liveroom
  return {
    platform,
    id,
    live: {
      title,
      cover,
      area: area ? [...area] : undefined,
      status,
      start_time,
    },
    anchor: {
      name: anchor.name,
      id: anchor.id,
      avatar: anchor.avatar
    },
    available,
    opening,
  }
}