import { MessageData } from './types/message/MessageData';
export function generateId(msg: MessageData):string {
  
  switch(msg.type) {
    case "gift":
      return `gift:${msg.info.user.id}-${msg.timestamp}`
    case "superchat":
      return `superchat:${msg.info.id}`
    case "membership":
      return `membership:${msg.info.user.id}-${msg.info.level||0}-${msg.timestamp}`
    default: 
      if (/^live_/.test(msg.type)) {
        return `${msg.type}:${msg.platform}:${msg.room}-${msg.timestamp}`
      } else {
        return `${msg.type}:${(msg.info as any).user?.id || 0}-${msg.timestamp}`
      }
  }
}
