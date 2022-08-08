import { Router } from "express";
import ChatRoomController from "../controller/ChatRoom.Controller";

class ChatRoomRoute {
  router: Router;
  constructor() {
    this.router = Router();
    this.routes();
  }

  routes() {
    this.router
      .route("/")
      .post(ChatRoomController.createChatRoom)
      .get(ChatRoomController.getRoom);
  }
}

export default new ChatRoomRoute().router;
