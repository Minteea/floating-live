"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
class msgSave {
    constructor(main, type, file, config = { encoding: "utf8", flag: "a" }) {
        this.paused = false;
        this.main = main;
        this.file = file;
        this.config = config;
        this.type = type;
        this.listener = (msg) => { if (!this.paused)
            this.write(msg); };
        this.main.on(this.type, this.listener);
    }
    write(message) {
        fs_1.default.writeFile(this.file, JSON.stringify(message) + ",", this.config, (err) => {
            if (err)
                throw err;
            // console.log('写入成功');
        });
    }
    pause() {
        this.paused = true;
    }
    /** 更改路径 */
    changeFile(file) {
        this.file = file;
    }
    /** 销毁实例 */
    destory() {
        this.main.removeListener(this.type, this.listener);
    }
}
exports.default = msgSave;
