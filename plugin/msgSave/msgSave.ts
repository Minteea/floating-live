import fs from "fs-extra";
import { FloatingLive } from "../..";

class msgSave {
  /** 主模块 */
  main: FloatingLive
  file: string;
  config: object;
  type: string;
  paused: boolean;
  listener: (msg: any) => void;
  constructor(main: FloatingLive, type: string, file: string, open: boolean = true, config = { encoding: "utf8", flag: "a" }) {
    this.paused = !open
    this.main = main
    this.file = file;
    this.config = config;
    this.type = type;
    this.listener = (msg) => {if (!this.paused) this.write(msg)}
    this.main.on(this.type, this.listener)
  }
  write(message: any) {
    fs.ensureFileSync(this.file)
    fs.writeFile(
      this.file,
      JSON.stringify(message) + ",",
      this.config,
      (err) => {
        if (err) throw err;
        // console.log('写入成功');
      }
    );
  }
  start() {
    this.paused = false
  }
  pause() {
    this.paused = true
  }
  /** 更改路径 */
  changeFile(file: string) {
    this.file = file
  }
  /** 销毁实例 */
  destory() {
    this.main.removeListener(this.type, this.listener)
  }
}

export default msgSave;
