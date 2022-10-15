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
    living,
    start_time,
    banned,
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
    living,
    start_time,
    banned,
  }
}