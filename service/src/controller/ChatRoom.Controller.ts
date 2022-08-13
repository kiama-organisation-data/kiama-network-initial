import { Request, Response } from "express";
import unique from "../libs/randomGen";
import * as uuidv4 from "uuid";
import redisConfig from "../libs/redis";
import AppResponse from "../services";
import ChatRoomModel from "../model/ChatRoom.Model";

/**
 * @function createChatRoom /chat-room                   -- post request
 * @function getRoom  /chat-room                         -- get request
 * @function joinRoom /chat-room                         -- patch request
 * @function getMembers /chat-room/members               -- get request
 * @function sendMsg /chat-room/msg                      -- post request
 * @function getMsgs /chat-room/msg                      -- get request
 */

class ChatRoomCntrl {
	constructor() {}

	// remeber to confirm if a user already made a room
	async createChatRoom(req: Request, res: Response) {
		const userId = req.user;
		if (!userId) return AppResponse.fail(res, "provide user's id in token");
		const randomId = unique();
		const randomId2 = unique();
		// const uuidModule = uuid;
		const roomId = `kiama-${randomId}-${randomId2}-knc`;

		/**
		 * Note: the maximum time for a chatroom is 3 hours in version 1.
		 * We are storing roomId as the key so that we can check if the user's id is the value
		 * If the userId then user becomes host
		 * Else user is a just a member of the meeting
		 */
		try {
			await redisConfig.addToRedis(roomId, userId.toString(), 60 * 60 * 3);
			const room = await ChatRoomModel.create({
				link: roomId,
			});
			return AppResponse.success(res, { roomId, room, time: "3 hours" });
			// remember to implement a cron task or implement frontend cron job
			// in frontend, a session will be used to store the roomId for access
		} catch (e) {
			AppResponse.fail(res, e);
		}
	}

	async getRoom(req: Request, res: Response) {
		const { user } = req;
		const roomId = req.query.roomId;

		try {
			const room = await redisConfig.getValueFromRedis(roomId.toString());
			if (!room) return AppResponse.notFound(res);

			let isHost: Boolean = false;
			//@ts-ignore
			if (room == user.toString()) isHost = true;

			AppResponse.success(res, { room, isHost });
		} catch (e) {
			AppResponse.fail(res, e);
		}
	}

	async joinRoom(req: Request, res: Response) {
		const { user } = req;
		const roomId = req.query.roomId;

		try {
			const room = await redisConfig.getValueFromRedis(roomId);
			if (!room) return AppResponse.notFound(res);

			let host: boolean = false;
			//@ts-ignore
			if (user.toString() === room) host = true;

			await ChatRoomModel.findOneAndUpdate(
				{ link: roomId },
				{ $push: { users: user } }
			);
			AppResponse.success(res, { host, user });
		} catch (e) {
			AppResponse.fail(res, e);
		}
	}

	async getMembers(req: Request, res: Response) {
		const { roomId } = req.query;

		try {
			const roomMembers = await ChatRoomModel.findOne({
				link: roomId,
			}).populate("users", "name avatar");
			//@ts-ignore
			delete roomMembers?.users.password;
			AppResponse.success(res, roomMembers);
		} catch (e) {
			AppResponse.fail(res, e);
		}
	}

	async sendMsg(req: Request, res: Response) {
		const { roomId, message } = req.body;
		const { user } = req;

		try {
			const msg = await ChatRoomModel.findOneAndUpdate(
				{ link: roomId },
				{ $push: { messages: { userId: user, text: message } } },
				{ new: true }
			);

			AppResponse.success(res, msg);
		} catch (e) {
			AppResponse.fail(res, e);
		}
	}

	async getMsgs(req: Request, res: Response) {
		const { roomId } = req.query;

		try {
			const msgs = await ChatRoomModel.findOne({ link: roomId }).select(
				"messages"
			);
			if (!msgs) return AppResponse.notFound(res);

			AppResponse.success(res, msgs);
		} catch (e) {
			AppResponse.fail(res, e);
		}
	}
}

export default new ChatRoomCntrl();
