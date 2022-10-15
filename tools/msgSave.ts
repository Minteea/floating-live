import fs from "fs";
import FloatingLiving from "..";

class msgSave {
  /** 主模块 */
  main: FloatingLiving
  file: string;
  config: object;
  type: string;
  paused: boolean = false;
  listener: (msg: any) => void;
  constructor(main: FloatingLiving, type: string, file: string, config = { encoding: "utf8", flag: "a" }) {
    this.main = main
    this.file = file;
    this.config = config;
    this.type = type;
    this.listener = (msg) => {if (!this.paused) this.write(msg)}
    this.main.on(this.type, this.listener)
  }
  write(message: any) {
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
