##### 插件来源（source 字段）

- managerName
- "plugin:{pluginName}" (插件调用)
- "" (app.emit())

##### 客户端/服务端来源（client.name 字段）

- "electron" (electron 客户端)
- "web:{clinetId}" (网络客户端)
- "server" (服务端)
- "" (自身环境内)

#### 机制

- from server/node = source: "plugin:foo"
  - to server/node = source: "plugin:foo" client: ""
  - to client/browser = source: "plugin:foo" client: "server"
  - to client/electron = source: "plugin:foo" client: "server"
- from client/browser = source: "plugin:foo"
  - to client/browser = source: "plugin:foo" client: ""
  - to server/node = source: "plugin:foo" client: "browser:10000001"

ctx.callWithOptions(name, options, ...args)
ctx.emitWithOptions(name, detail, options)

ctx.on()

client.emit()
