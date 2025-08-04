const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const users = [];

io.on("connection", (socket) => {
    socket.on("register", (username) => {
        const exists = users.some(e => e.username === username);
        if (exists) {
            socket.emit("response", { status: "error", msg: "This username is not available for now." });
        } else {
            users.push({ username, id: socket.id });
            socket.emit("response", { status: "success", msg: "Register successfully." });
            io.emit("chats", users);
        }
    });
    socket.on("chat", (res) => {
        const to = users.filter(u => u.username === res.to)[0]?.id;
        io.to(to).emit("chat", res);
    })
    socket.on("disconnect", () => {
        users.map((u, i) => { if (u.id === socket.id) users.splice(i, 1); });
        io.emit("chats", users);
    })
})

app.get("/", (req, res) => {
    res.send("Websocket running.");
})

server.listen(3001);