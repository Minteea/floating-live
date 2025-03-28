import { App } from "./app";
import { Room } from "./plugins/room";

export class FloatingLive extends App {
  room: Room;
  constructor() {
    super();
    this.room = new Room(this);
  }
}
