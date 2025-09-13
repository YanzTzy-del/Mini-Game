const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: process.env.PORT || 8080 });

let players = {};
let blocks = [];

wss.on("connection", (ws) => {
  const id = Date.now().toString();
  players[id] = { x: 0, y: 2, z: 0, rotY: 0 };

  ws.send(JSON.stringify({ type: "init", id, players, blocks }));

  ws.on("message", (msg) => {
    const data = JSON.parse(msg);

    if (data.type === "move") {
      players[id] = data.player;
      broadcast({ type: "update", id, player: data.player }, ws);
    }
    if (data.type === "block") {
      blocks.push(data.block);
      broadcast({ type: "block", block: data.block });
    }
  });

  ws.on("close", () => {
    delete players[id];
    broadcast({ type: "leave", id });
  });
});

function broadcast(data, exceptWs=null) {
  const msg = JSON.stringify(data);
  wss.clients.forEach(client => {
    if (client !== exceptWs && client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  });
}

console.log("Server running...");