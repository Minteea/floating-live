import { Message } from "./message";

export interface FloatingHookMap {
  message: Message.All;
  add: Record<string, any>;
}
