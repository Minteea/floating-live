# Floating Living
一个用于处理和保存直播弹幕的Node.js小工具，开箱即用。

目前支持bilibili和AcFun的直播弹幕。

项目仍在开发中，功能尚未完善，目前除了记录保存直播弹幕外暂时没有别的用处啦，敬请期待。

## 使用方法
* 下载并安装 `Node.js` ，建议下载最新LTS版本（如果已经安装可跳过这一步）。
* 下载该项目的zip压缩包，解压，并在项目根目录下新建一个名为 `save` 的文件夹
* 打开 `living.js` ，修改 `id` 和 `platform` 的值，示例：
  ``` javascript
  const id = 254992     // 直播间id
  const platform = "bilibili"   // 直播平台
  ```
  目前支持的 `platform` 值有：`acfun`、`bilibili`
* 在项目根目录的控制台输入下列命令
  ```
  node .\src\server\server.js
  ```
  即可接收来自平台的直播弹幕，弹幕保存在 `save` 文件夹中

## 感谢
* [bilibili-live-ws](https://github.com/simon300000/bilibili-live-ws/) / by Simon300000：与bilibili直播建立Websocket连接并解码数据包
* [ac-danmu](https://github.com/ACFUN-FOSS/ac-danmu.js) / by ACFUN-FOSS：与AcFun直播建立Websocket连接并解码数据包

## TODO
* 添加弹幕过滤功能
* 添加命令提取功能
* 可读取json配置文件
* 实现数据包发送服务

## 开发路线
#### 🟢 Alpha @danmaku 
* 写一段Nodejs代码，用于记录保存bilibili的直播弹幕
#### 🟡 0.x @message 
* 支持不同的消息类型和不同的平台
* 模块化、配置化
* 实现数据包发送服务
#### ⚪ 1.x @stage
* 搭建前端界面，实现聊天板功能
* 添加多种UI组件
#### ⚪ 2.x @backstage
* 添加后台控制界面
* 实现多个界面舞台
#### ⚪ 3.x @electron
* 实现Electron后台界面
#### ⚪ 4.x @floating
* 实现Electron界面舞台和UI组件