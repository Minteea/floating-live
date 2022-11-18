import Controller from ".";
import FloatingLive from "..";
import { MessageType } from "../types/message/MessageData";

export default class Message {
  readonly controller: Controller
  readonly main: FloatingLive
  constructor(controller: Controller) {
    this.controller = controller
    this.main = controller.main
  }
  send(msg: MessageType) {
    this.main.helper.messageHandler.getList().forEach((handler) => {
      handler(msg)
    })
    this.main.emit("live_message", msg)
  }
}
