import server from "./server";
import socket from "./libs/socket";
import express, { Response, Request, NextFunction } from 'express';

const PORT = process.env.PORT || process.env.APP_PORT;

const http = require('http').Server(server.app)
const io = socket.init(http, {
    allowEIO3: true,
    transports: ['websocket', 'polling']
})

server.app.use((req: any, res: Response, next: NextFunction) => {
    req.io = io
    next()
})

server.routes()

server.app.get('/', (req: Request, res: Response) => {
    res.send("Welcom to kiama-network API enjoy!")
})


io.user = {}
io.on('connection', (socket: any) => {
    socket.on('login', (user: any) => {
        Object.assign(io.user, {
            ["_" + user._id]: {
                socket,
                userData: user
            },
        })
        console.log('[SOCKET] User socket: [_' + user._id + "] connected")
    })

})

http.listen(PORT, () => {
    console.log("Express server listening on port " + PORT)
})

