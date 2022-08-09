import { Request, Response } from "express";
import { uploadToCloud } from "../libs/cloudinary";
// import joiValidation from "../libs/joiValidation";
import { IPrmsg, privateMsgModel } from "../model/Messages.Model";
import AppResponse from "../services/index";

//remeber to add try catch to all functions
class PrivateMsgController {
  constructor() {}

  /**
   * remember to implement functionality to restrict how users messages can be forwarded
   * @function sendMsg handles creation of a new message, also remeber to passes check for
   * body or file
   * @constant audioMimeType will be updated in the future to support only a single file type
   * @constant imageMimeType will be updated in the future to support only 4 file mimeTypes
   * @function deleteMessage on the front-office, only the last two messages can be deleted
   * also, the messageFormat will be used to determine what if message is image, audio or text
   * so as to display message correctly
   * @function addReply in the future, remeber to make replies accept audio and images.
   * @function setMsgAsFowarded this method together with sendMsg will be modified in the future
   * to depend on each other for better performance
   */

  // All routes for this controller

  /**
   *
   * Note: all routes are appended to http://localhost:port/kiama-network/v1/api
   * @function sendMsg  /msg                                                        -- post request
   * @function getMessages /msg                                                     -- get request
   * @function deleteMessage /msg/:id                                               -- delete request
   * @function addReply /msg/reply/:id                                              -- post request
   * @function markSeen /msg/mark-seen/:id                                          -- put request
   * @function addReaction /msg/add-reaction/:id                                    --put request
   * @function setMsgAsFowarded /msg/set-forwarded/:id
   *
   * totalRoutes: 7
   */

  sendMsg = async (req: Request, res: Response) => {
    let audio: object = {};
    let image: object = {};
    let text: string = "";
    let msgFormat: string = "";
    let url: string;
    let publicId: string;

    const audioMimeType = ["audio/mp3", "audio/wmp", "audio/mpeg"];
    const imageMimeType = ["image/jpeg", "image/pdf", "image/gif"];

    if (req.file) {
      const data = await uploadToCloud(req.file?.path);
      url = data.secure_url;
      publicId = data.public_id;
    }

    if (req.file) {
      if (audioMimeType.includes(req.file.mimetype)) {
        audio = {
          // @ts-ignore
          publicId,
          // @ts-ignore
          url,
        };
        msgFormat = "audio";
      } else if (imageMimeType.includes(req.file.mimetype)) {
        image = {
          // @ts-ignore
          publicId,
          // @ts-ignore
          url,
        };
        msgFormat = "image";
      } else {
        res.status(400).json({ msg: "not a valid file type", success: "fail" });
      }
    } else {
      if (req.body) {
        text = req.body.text;
        msgFormat = "text";
      }
    }
    try {
      const newMsg: IPrmsg = await privateMsgModel.create({
        message: {
          text,
          audio,
          image,
        },
        users: [req.body.from, req.body.to], //Note: this req.body.to and .from will be supplied by front-office
        sender: req.body.from,
        messageFormat: msgFormat,
      });

      if (!newMsg)
        return AppResponse.fail(res, "an error occured while saving");

      AppResponse.created(res, newMsg);
    } catch (e) {
      AppResponse.fail(res, e);
    }
  };

  // remeber to add pagination
  getMessages = async (req: Request, res: Response) => {
    const { from, to } = req.query;

    try {
      const messages = await privateMsgModel
        .find({
          users: {
            $all: [from, to],
          },
        })
        .sort({ updatedAt: 1 });

      const msgs = messages.map((msg) => {
        return {
          from: msg.sender.toString() === from,
          // @ts-ignore
          message: msg.message.text || msg.message.audio || msg.message.image,
          reply: msg.reply,
          // @ts-ignore
          time: msg.message.updatedAt,
          user1: msg.users[0],
          user2: msg.users[1],
          messageFormat: msg.messageFormat,
          seen: msg.seen,
          reaction: msg.reaction,
          id: msg._id,
        };
      });
      if (!msgs)
        return AppResponse.fail(
          res,
          "there is no conversation between you two"
        );

      AppResponse.success(res, msgs);
    } catch (e) {
      AppResponse.fail(res, e);
    }
  };

  deleteMessage = async (req: Request, res: Response) => {
    await privateMsgModel.findByIdAndDelete(req.params.id);
    AppResponse.success(res, "deleted");
  };

  addReply = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { from, text } = req.body;
    if (!id || !text || !from)
      return AppResponse.fail(res, "please provide data");

    try {
      let msg = await privateMsgModel.findByIdAndUpdate(
        id,
        { $push: { reply: { text, from } } },
        { new: true }
      );

      AppResponse.success(res, msg);
    } catch (error) {
      AppResponse.fail(res, error);
    }
  };

  markSeen = async (req: Request, res: Response) => {
    try {
      await privateMsgModel.findByIdAndUpdate(req.params.id, {
        $set: { seen: true },
      });
      AppResponse.success(res, "updated");
    } catch (error) {
      AppResponse.fail(res, error);
    }
  };

  addReactions = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { reaction } = req.body;
    // remeber to add joi validation

    const reactions = ["laughing", "angry", "love"];

    if (!reactions.includes(reaction)) {
      return AppResponse.fail(res, "reaction is not valid");
    }
    try {
      await privateMsgModel.findByIdAndUpdate(id, { $set: { reaction } });

      AppResponse.success(res, "updated");
    } catch (e) {
      AppResponse.fail(res, e);
    }
  };

  //right now this function will be only called on the front-office when a sendMsg has
  setMsgAsFowarded = async (req: Request, res: Response) => {
    try {
      await privateMsgModel.findByIdAndUpdate(req.params.id, {
        $set: { forwarded: true },
      });
      AppResponse.success(res, "updated");
    } catch (e) {
      AppResponse.fail(res, e);
    }
  };
}

export default new PrivateMsgController();
