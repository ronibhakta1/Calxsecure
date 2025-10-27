import express from "express";
import WebSocket, { WebSocketServer } from "ws";


const app = express();
const httpServer = app.listen(8080, () => {
    console.log("HTTP server listening on port 8080");
});

const wss = new WebSocketServer({ server: httpServer });

wss.on("connection", function connection(ws) {
    ws.on("error", console.error);

    ws.on("message", function incoming(data , isBinary) {
        wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(data , { binary: isBinary } );  
            }
        });
    });
    ws.send("Welcome to the WebSocket server!");
    
});
