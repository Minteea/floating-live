import { Message } from "./message";

export interface FloatingHookMap {
  message: Message.All;
  add: { platform: string; id: string | number; options: Record<string, any> };
}
