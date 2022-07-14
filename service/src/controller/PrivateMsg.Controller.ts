import { Request, Response } from "express";
import joiValidation from "../libs/joiValidation";
import { IPrmsg, privateMsgModel } from "../model/Messages.Model";
import AppResponse from "../services/index";

//remeber to add try catch to all functions
class PrivateMsgController {
  constructor() {}

  /**
   * @function sendMsg handles creation of a new message, also remeber to passa check for
   * body or file
   * @constant newMsg, the 'to' property is the id of the user this message is sent to while
   * the 'from' is the id of the sender
   * @constant audioMimeType will be updated in the future to support only a single file type
   * @constant imageMimeType will be updated in the future to support only 4 file mimeTypes
   * @function deleteMessage on the front-office, only the last two messages can be deleted
   * also, the messageFormat will be used to determine what if message is image, audio or text
   * so as to display message correctly
   * @function addReply in the future, remeber to make replies accept audio and images.
   * @function setMsgAsFowarded this method together with sendMsg will be modified in the future
   * to depend on each other for better performance
   */

  sendMsg = async (req: Request, res: Response) => {
    let audio: object = {};
    let image: object = {};
    let text: string = "";
    let msgFormat: string = "";

    const audioMimeType = ["audio/mp3", "audio/wmp", "audio/mpeg"];
    const imageMimeType = ["image/jpeg", "image/pdf", "image/gif"];

    if (req.file) {
      if (audioMimeType.includes(req.file.mimetype)) {
        audio = {
          publicId: "nothing yet", //Note: would be implemented later with cloudinary
          url: req.file.path,
        };
        msgFormat = "audio";
      } else if (imageMimeType.includes(req.file.mimetype)) {
        image = {
          publicId: "nothing yet", //Note: would be implemented later with cloudinary
          url: req.file.path,
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

    if (!newMsg) return AppResponse.fail(res, "an error occured while saving");

    AppResponse.created(res, newMsg);
  };

  getMessages = async (req: Request, res: Response) => {
    const { from, to } = req.body;

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
        //@ts-expect-error
        message: msg.message.text || msg.message.audio || msg.message.image,
        reply: msg.reply,
        //@ts-expect-error
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
      return AppResponse.fail(res, "there is no conversation between you two");

    AppResponse.success(res, msgs);
  };

  deleteMessage = async (req: Request, res: Response) => {
    await privateMsgModel.findByIdAndDelete(req.params.id);
    AppResponse.success(res, "deleted");
  };

  addReply = async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id || !req.body.text)
      return AppResponse.fail(res, "please provide data");

    let msg = await privateMsgModel.findById(id);
    if (!msg) return AppResponse.notFound(res, "not found any messages");
    //@ts-expect-error
    msg.reply.text = req.body.text;
    //@ts-expect-error
    msg.reply.from = req.body.from;
    msg = await msg.save();

    try {
      AppResponse.success(res, msg);
    } catch (error) {
      AppResponse.fail(res, error);
    }
  };

  markSeen = async (req: Request, res: Response) => {
    let msg = await privateMsgModel.findById(req.params.id);
    if (!msg) {
      return AppResponse.notFound(res, "message not found");
    }
    msg.seen = true;
    msg = await msg.save();
    AppResponse.success(res, "");
  };

  addReactions = async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id || !req.body.reaction)
      return AppResponse.fail(res, "provide a reaction");

    const reactions = ["laughing", "angry", "love"];

    if (!reactions.includes(req.body.reaction)) {
      return AppResponse.fail(res, "reaction is not valid");
    }

    let msg = await privateMsgModel.findById(id);

    if (!msg) return AppResponse.notFound(res, "message not found");

    msg.reaction = req.body.reaction;
    msg = await msg.save();

    try {
      AppResponse.success(res, msg);
    } catch (e) {
      AppResponse.fail(res, e);
    }
  };

  //right now this function will be only called on the front-office when a sendMsg has
  setMsgAsFowarded = async (req: Request, res: Response) => {
    let msg = await privateMsgModel.findById(req.params.id);
    if (!msg) {
      return AppResponse.notFound(res, "message not found");
    }

    msg.forwarded = true;
    msg = await msg.save();
    AppResponse.success(res, msg);
  };
}

export default new PrivateMsgController();
