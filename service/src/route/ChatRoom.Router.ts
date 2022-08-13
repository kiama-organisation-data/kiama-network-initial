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
			.get(ChatRoomController.getRoom)
			.patch(ChatRoomController.joinRoom);

		this.router.route("/members").get(ChatRoomController.getMembers);
		this.router
			.route("/msg")
			.post(ChatRoomController.sendMsg)
			.get(ChatRoomController.getMsgs);
	}
}

export default new ChatRoomRoute().router;
