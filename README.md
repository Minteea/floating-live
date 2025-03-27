# Floating Live

一个用于处理和保存直播弹幕的 Web 小工具，开箱即用。

本体无弹幕获取功能，需要配合[floating-live-plugins](https://github.com/Minteea/floating-live-plugins)中的插件使用。

目前插件库支持 bilibili 和 AcFun 的直播弹幕，不同平台的弹幕会转换为同一种格式便于保存。

项目仍在开发中，功能尚未完善，目前除了记录保存直播弹幕外暂时没有别的用处啦，敬请期待。

注意：当前项目未进入正式版本阶段，程序结构及导出数据结构可能随时改动，**非常不建议用于正式项目中**。

GUI 版本：[Minteea/floating-live-gui](https://github.com/Minteea/floating-live-gui)

## 使用方法

### npm 安装

```
npm install floating-live
```

```javascript
// 导入FloatingLive本体
import { FloatingLive } from "floating-live";
// 导入bilibili房间生成插件
import bilibili from "@floating-live/bilibili";

// 创建一个FloatingLive实例
const live = new FloatingLive();
// 注册插件
live.plugin.register(bilibili);

// 添加房间并自动打开
live.room.add("bilibili", 6, true);
```
