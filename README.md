# Floating Live
一个用于处理和保存直播弹幕的Node.js小工具，开箱即用。

目前支持bilibili和AcFun的直播弹幕，不同平台的弹幕会转换为同一种格式便于保存。

项目仍在开发中，功能尚未完善，目前除了记录保存直播弹幕外暂时没有别的用处啦，敬请期待。

注意：当前项目未进入正式版本阶段，程序结构及导出数据结构可能随时改动，**非常不建议用于正式项目中**。

GUI版本：[Minteea/floating-live-gui](https://github.com/Minteea/floating-live-gui)

## 使用方法
### npm安装
```
npm install floating-live
```
``` javascript
// 导入FloatingLive
const { FloatingLive } = require("floating-live")
// 导入bilibili房间生成插件
const bilibili = require("floating-live/plugin/bilibili")   

// 创建一个FloatingLive实例
const live = new FloatingLive()
// 注册插件
live.plugin.register(bilibili)

// 添加房间并自动打开
live.rooms.add("bilibili", 6, true)
```

### 拆包即用模式
* 下载并安装 `Node.js` ，建议下载最新LTS版本（如果已经安装可跳过这一步）。
* 下载该项目的zip压缩包，解压，并在项目根目录下新建一个名为 `save` 的文件夹。
* 在项目根目录的控制台输入下列命令，安装所有依赖包。
  ```
  npm install
  ```
#### 运行Demo文件
* 打开demo/demo.ts
  ``` typescript
  // ...
  const config = {
    rooms: [
      {
        platform: "bilibili", // 直播平台
        id: 2064239,          // 直播间号
      },
    ],
  };
  // ...
  ```
* 根据需要修改直播平台和直播间号，目前支持的 `platform` 值有：`acfun`、`bilibili`(注意是小写)，也可以通过自定义插件添加直播平台
* 在项目根目录的控制台输入下列命令：
  ```
  npm run test
  ```
  即可接收来自平台的直播弹幕。

## 感谢
### 使用开源库
* [simon300000/bilibili-live-ws](https://github.com/simon300000/bilibili-live-ws/)
* [ACFUN-FOSS/ac-danmu](https://github.com/ACFUN-FOSS/ac-danmu.js)
