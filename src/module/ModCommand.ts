import { Reglist } from "../abstract/Reglist";

export default class ModCommand extends Reglist<
  (e: any, ...args: any) => void
> {}
