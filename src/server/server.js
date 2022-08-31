const http = require("http")
const living = require("./living/living.js")
const WebSocket = require('ws')
const WebSocketServer = WebSocket.Server

// 创建living实例
const live = new living(
[
    {
        platform: "bilibili",
        id: 2064239
    },
])

// http 服务器
const server = http.createServer()
server.listen(8240, () => {
    console.log('Floating Living Server is on :)')
})

server.on('request', (req, res) => {
    const url = req.url
    const method = req.method
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    let str = `url: ${url}  |  method: ${method}`
    res.end(str)
})

// WebSocket 服务器
const wss = new WebSocketServer({ port: 8130 })

wss.broadcast = function (data, route) {
    this.clients.forEach((ws) => {
        if (!route || ws.route == route) {
            ws.send(data)
        }
    })
}

wss.on('connection', (ws, req) => {
    console.log('server: 有客户端连接WebSocket服务器');
    ws.route = req.url
    switch (req.url) {
        case "/message":
            console.log('server: 该客户端接收message信息')
            break
        case "/command":
            console.log('server: 该客户端接收command信息')
            break
    }
    ws.on('message', (message) => {
        clientMessage(message.toString(), ws)
    });
});
wss.on('close', (ws) => {
    console.log('server: 有客户端断开WebSocket服务器')
})
live.on("message", (data) => {
    wss.broadcast(JSON.stringify(data), "/message")
})
live.on("command", (data) => {
    wss.broadcast(JSON.stringify(data), "/command")
})

function clientMessage(message, ws) {
    let msg = JSON.parse(message)
    switch (msg.type) {
        case "eval":
            evalCmd(msg.eval)
    }
}

function evalCmd(str) {
    try {
        eval(str)
        console.log('floating-living: 成功执行指令')
        console.log('> ' + str)
    } catch (error) {
        console.log('floating-living: 指令执行错误')
        console.log('> ' + str)
        console.log(`${error.name}: ${error.message}`)
    }
}