"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bilibiliLive_1 = __importDefault(require("../Platform/bilibiliLive"));
const acfunLive_1 = __importDefault(require("../Platform/acfunLive"));
/** 直播间监听实例生成器 */
class LiveRoomGenerator {
    constructor() {
        this.generatorMap = new Map();
        this.addPlatform("bilibili", (id, open) => {
            let key = `bilibili:${Number(id)}`;
            let room = new bilibiliLive_1.default(Number(id), open);
            return { key, room };
        });
        this.addPlatform("acfun", (id, open) => {
            let key = `acfun:${Number(id)}`;
            let room = new acfunLive_1.default(Number(id), open);
            return { key, room };
        });
    }
    /** 生成一个房间 */
    generate(r, open) {
        let platform;
        let id;
        if (typeof r == "string") {
            let arr = r.split(":");
            platform = arr[0].toLowerCase();
            id = arr[1];
        }
        else {
            platform = r.platform.toLowerCase();
            id = r.id;
        }
        let platformGenerator = this.generatorMap.get(platform);
        if (platformGenerator) {
            return platformGenerator(id, open);
        }
        else {
            console.log(`[LiveRoomGenerator]不支持该平台:${platform}`);
        }
    }
    addPlatform(platform, generator) {
        this.generatorMap.set(platform, generator);
    }
}
exports.default = LiveRoomGenerator;
