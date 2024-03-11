import { Message } from "./message";

export interface FloatingHookMap {
  message: { message: Message.All };
  "room.add": {
    platform: string;
    id: string | number;
    options: Record<string, any>;
  };
  "plugin.register": {
    name: string;
    options: Record<string, any>;
  };
}
