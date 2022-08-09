import { Request, Response } from "express";
import unique from "../libs/randomGen";
import * as uuid from "uuid";
import redisConfig from "../libs/redis";
import AppResponse from "../services";

/**
 * @function createChatRoom /chat-room                   -- post request
 * @function getRoom  /chat-room                         -- get request
 */

class ChatRoomCntrl {
  constructor() {}

  async createChatRoom(req: Request, res: Response) {
    const userId = req.body.userId;
    const randomId = unique();
    const uuidModule = uuid.v3("kiamachat", "chatrooomspace");
    const roomId = `kiama-${randomId}-${uuidModule}-knc`;

    /**
     * Note: the maximum time for a chatroom is 3 hours in version 1.
     * We are storing roomId as the key so that we can check if the user's id is the value
     * If the userId then user becomes host
     * Else user is a just a member of the meeting
     */
    try {
      await redisConfig.addToRedis(roomId, userId.toString(), 60 * 60 * 3);
      return AppResponse.success(res, { roomId, time: "3 hours" });
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
      const room = await redisConfig.getValueFromRedis(roomId);
      if (!room) return AppResponse.notFound(res);

      const isHost: Boolean = false;
      //@ts-ignore
      if (room == user.toString()) isHost = true;

      AppResponse.success(res, { room, isHost });
    } catch (e) {
      AppResponse.fail(res, e);
    }
  }
}

export default new ChatRoomCntrl();
