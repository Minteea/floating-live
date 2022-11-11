import http from "http";
import FloatingLiving from "../";
import WebSocket from "ws";
import { chatPrint, msgSave } from "../tools";

const WebSocketServer = WebSocket.Server;

// 创建living实例
const living = new FloatingLiving({
  rooms: [
    {
      platform: "acfun",
      id: 12648555,
    },
  ],
  opening: true,
});

/** 初始化内置插件 */
let startDate = new Date(living.timestamp)
let fileId = `${startDate.getFullYear()}${(startDate.getMonth() + 1).toString().padStart(2, '0')}${startDate.getDate().toString().padStart(2, '0')}_${startDate.getHours().toString().padStart(2, '0')}${startDate.getMinutes().toString().padStart(2, '0')}${startDate.getSeconds().toString().padStart(2, '0')}-${living.liveRoomController.roomList[0].replace(":", "-")}`
living.addPlugin("chatPrint", main => (new chatPrint(main)))
living.addPlugin("msgSave", main => (new msgSave(main, "msg", `./save/${fileId}.txt`)))
living.addPlugin("msgSave_origin", main => (new msgSave(main, "origin", `./save/${fileId}-origin.txt`)))

// http 服务器
const server = http.createServer();
server.listen(8240, () => {
  console.log("Floating Living Server is on :)");
});

server.on("request", (req, res) => {
  const url = req.url;
  const method = req.method;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  let str = `url: ${url}  |  method: ${method}`;
  res.end(str);
});

// WebSocket 服务器
const wss = new WebSocketServer({ port: 8130 });

function broadcast (data: any) {
    wss.clients.forEach((ws) => {
      ws.send(data);
  });
};

wss.on("connection", (ws: WebSocket.WebSocket, req) => {
  console.log("server: 有客户端连接WebSocket服务器");
  ws.on("message", (message) => {
    console.log(message.toString());
  });
});
wss.on("close", (ws: WebSocket.WebSocket) => {
  console.log("server: 有客户端断开WebSocket服务器");
});

living.on("msg", (data: any) => {
  broadcast(JSON.stringify(data));
});

