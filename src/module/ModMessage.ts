import { Message } from "../types/message";
import { FloatingLive } from "..";
import { Reglist } from "../abstract/Reglist";
export class ModMessage {
  main: FloatingLive;
  public handler: Reglist<(msg: Message.All) => void>;
  constructor(main: FloatingLive) {
    this.main = main;
    this.handler = new Reglist(main, "message.handler");
  }
  handle(msg: Message.All) {
    this.handler.getList().forEach((handler) => {
      handler(msg);
    });
  }
}
