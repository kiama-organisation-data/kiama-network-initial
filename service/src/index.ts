import server from "./server";
import socket from "./libs/socket";
import express, { Response, Request, NextFunction } from "express";
import { Socket } from "socket.io";

const PORT = process.env.PORT || process.env.APP_PORT;

const http = require("http").Server(server.app);
const io = socket.init(http, {
  allowEIO3: true,
  transports: ["websocket", "polling"],
});

server.app.use((req: any, res: Response, next: NextFunction) => {
  req.io = io;
  next();
});

server.routes();

server.app.get("/", (req: Request, res: Response) => {
  res.send("Welcom to kiama-network API enjoy!");
});

io.user = {};
io.on("connection", (socket: any) => {
  socket.on("login", (user: any) => {
    Object.assign(io.user, {
      ["_" + user._id]: {
        socket,
        userData: user,
      },
    });
    console.log("[SOCKET] User socket: [_" + user._id + "] connected");
  });
  socket.on("typing", (username: string, to: any) => {
    socket.to(to).emit("typing", username);
  });
  socket.on(
    "sent-message",

    (
      sender: any,
      to: any,
      content: any,
      nickname: string,
      contentType: any,
      isGroup: any
    ) => {
      const socketPack = {
        sender,
        content,
        contentType,
      };
      const socketPackS = {
        nickname,
        ...socketPack,
      };
      if (isGroup) {
        socket.emit("new-message", socketPack);
      } else {
        socket.emit("new-message", socketPackS);
      }
    }
  );
  socket.on("read-message", (to: any) => {
    socket.emit("message-read", to);
  });
  socket.on("recording-audio", (username: string, to: any) => {
    socket.emit("recording-audio", username, to);
  });
  socket.on("reacted", (username: string, to: any) => {
    socket.emit("reacted", username, to);
  });
  socket.on("deleted-message", (username: string, to: any) => {
    socket.emit("deleted-message", username, to);
  });
  socket.on("call", (from: any, to: any, location: Array<any>) => {
    // the location param holds two or more values depending on if a me -to- you call or me -to- group call
    // will emit to a function or method in the app that is responsibe for calls
  });
});

http.listen(PORT, () => {
  console.log("Express server listening on port " + PORT);
});
