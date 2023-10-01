import { FloatingLive } from "..";
import { Reglist } from "../abstract/Reglist";

export default class ModCommand extends Reglist<(...args: any[]) => any> {
  constructor(main: FloatingLive) {
    super(main, "command");
  }

  /** 批量注册命令 */
  batchRegister(list: Record<string, (...args: any) => any>) {
    for (const key in list) {
      this.register(key, list[key]);
    }
  }
  /** 执行命令 */
  execute(name: string, ...args: any[]) {
    return this.get(name)?.(...args);
  }
}
