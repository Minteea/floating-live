import LiveRoom from "./LiveRoom";
import RoomInfo from "./RoomInfo";

export default function getRoomInfo(liveroom: LiveRoom): RoomInfo {
  let {
    platform,
    id,
    title,
    area,
    cover,
    anchor,
    keep_connection,
    status,
    start_time,
    opening,
  } = liveroom
  return {
    platform,
    id,
    title,
    area: area ? [...area] : undefined,
    cover,
    anchor: {
      name: anchor.name,
      id: anchor.id,
      avatar: anchor.avatar
    },
    keep_connection,
    status,
    start_time,
    opening,
  }
}