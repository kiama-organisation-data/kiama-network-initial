import { NextFunction, Request, Response } from "express";
import {
  groupModel,
  groupMsgModel,
  IGrmsg,
  IGroup,
} from "../model/Messages.Model";
import Users from "../model/UsersAuth.Model";

/**
 * @function createGroup will create a new group setting the creator as admin an member
 * in the future cloudinary will be used for the image processing
 * also, replacing members with doublyLinked list rather than arrays
 * @function editGroup will only edit other group fileds except image
 * @function editGroupPhoto will edit the group photo accepting only jpg, jpeg and png.
 * @function deleteGroupPhoto will set the publicId and url of group image to null
 * @param isAdmin remember to set this to a middleware in the future
 * @param createGroup admin should be changed to work with more than one id
 * @function removeMember in the future should also remove the groups id from the group
 * param in user model
 * @function deleteGroup in the future should remove the groups id from the user model
 * @function sendMessage in the future a timeStamp will be used to calculate seconds before
 * not allowing for deleting anymore
 */

class GroupController {
  constructor() {}

  /**
   * Up until next comment at line 200+, here only handles group functionalities
   * and not messaging in group
   */

  createGroup = async (req: Request, res: Response) => {
    //id is the id of the group creator
    const imageMimeType = ["image/jpeg", "image/png", "image/jpg"];

    if (req.file) {
      if (!imageMimeType.includes(req.file?.mimetype))
        return res
          .status(400)
          .json({ success: "fail", msg: "the filetype is not accepted" });
    }

    const { id } = req.params;
    let user = await Users.findById(id).select(["username", "_id", "groups"]);

    if (!user)
      return res.status(404).json({ success: "fail", msg: "user not found" });

    const group: IGroup = await groupModel.create({
      ...req.body,
      members: [id],
      admin: {
        id: user._id,
        username: user.username,
      },
      image: {
        url: req.file ? req.file.path : null,
        publicId: null,
      },
      isImage: req.file ? true : false,
      size: 1,
    });

    user.groups.push(group._id);
    user = await user.save();
    if (!group) {
      res.status(400).json({ success: "fail" });
    } else {
      res.status(201).json({ success: "true", data: group, user });
    }
  };

  editGroup = async (req: Request, res: Response) => {
    const { id } = req.params; // admins Id

    const groupId = req.body.id;

    const isAdmin = await groupModel.findOne({ _id: groupId });
    if (!isAdmin)
      return res
        .status(404)
        .json({ success: "fail", msg: "there's no group found" });

    //@ts-expect-error
    if (isAdmin.admin.id.toString() !== id) {
      res.status(403).json({ success: "fail", msg: "you are not admin" });
    } else {
      const body = req.body;
      const group = await groupModel.findByIdAndUpdate(groupId, body);
      res.status(200).json({ success: "true", data: group });
    }
  };

  editGroupPhoto = async (req: Request, res: Response) => {
    if (!req.file)
      return res.status(400).json({ success: "fail", msg: "provide an image" });

    let group = await groupModel.findById(req.body.id);

    if (!group) {
      res.status(404).json({ success: "false", msg: "group not found" });
    } else {
      //@ts-expect-error
      if (group.admin.id.toString() !== id)
        return res
          .status(403)
          .json({ success: "fail", msg: "you are not permitted" });

      const imageMimeType = ["image/jpeg", "image/png", "image/jpg"];

      if (!imageMimeType.includes(req.file.mimetype))
        return res
          .status(400)
          .json({ success: "fail", msg: "not a valid file type" });

      // In the future cloudinary would be used here
      //@ts-expect-error
      group.image.url = req.file.path;
      //@ts-expect-error
      group.image.publicId = "dummy"; //will be proccessed with cloudinary in the future
      group = await group.save();
      res.status(200).json({ success: "true", data: group });
    }
  };

  deleteGroupPhoto = async (req: Request, res: Response) => {
    let group = await groupModel.findOne({ _id: req.body.id });

    if (!group) {
      res.status(404).json({ success: "fail", msg: "group not found" });
    } else {
      //@ts-expect-error
      if (group.admin.id.toString() !== id)
        return res
          .status(403)
          .json({ success: "fail", msg: "You are not permitted" });

      //@ts-expect-error
      group.image.url = null;
      //@ts-expect-error
      group.image.publicId = null;
      group.isImage = false;
      group = await group.save();
      res.status(200).json({ success: "true", data: group });
    }
  };

  addMember = async (req: Request, res: Response) => {
    let group = await groupModel.findById(req.body.id);

    if (!group) {
      res.status(404).json({ success: "fail", msg: "group not found" });
    } else {
      //@ts-expect-error
      if (group.admin.id.toString() !== req.params.id)
        return res.status(400).json({ success: "fail", msg: "not permitted" });

      let user = await Users.findById(req.body.member);

      if (!user)
        return res.status(404).json({ success: "fail", msg: "user not found" });

      user.groups.push(group._id);
      group.members.push(req.body.member); //req.body.member is user id;
      group.size = group.size + 1;
      group = await group.save();
      user = await user.save();
      res.status(200).json({ success: "true", data: group });
    }
  };

  removeMember = async (req: Request, res: Response) => {
    let group = await groupModel.findById(req.body.id);
    if (!group)
      return res.status(404).json({ success: "fail", msg: "group not found" });

    //@ts-expect-error
    if (group.admin.id.toString() !== id) {
      res.status(403).json({ success: "fail", msg: "not permitted" });
    } else {
      //remeber to change members to use a linked list for effeciency in query
      let memberToBeDeleted: String = "";
      group.members.map((member) => {
        if (member.toString() === req.body.member) {
          memberToBeDeleted = member;
        }
      });
      //@ts-expect-error
      const deleted = await group.removeMember(memberToBeDeleted);
      if (deleted) {
        res.status(200).json({ success: "true", data: group });
      } else {
        res.status(400).send({ success: "fail" });
      }
    }
  };

  deleteGroup = async (req: Request, res: Response) => {
    await groupModel.findByIdAndDelete(req.params.id);
    try {
      res.status(200).json({ success: "true" });
    } catch (e) {
      res.status(400).send(e);
    }
  };

  exitGroup = async (req: Request, res: Response) => {
    let user = await Users.findById(req.params.id).select("groups");

    let group = await groupModel.findById(req.body.id).select("removeMember");

    if (!user || !group) {
      res.status(404).json({ success: "fail", msg: "user can't be found" });
    } else {
      const result = group.removeMember(req.params.id);
      if (!result) return res.status(400).json({ success: "fail" });
      res.status(200).json({ success: "true", data: group });
    }
  };

  /**
   * From here down begins the implementation of all the messaging functionalities
   */

  sendMessage = async (req: Request, res: Response) => {
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
    const newMsg: IGrmsg = await groupMsgModel.create({
      message: {
        text,
        audio,
        image,
      },
      sender: req.body.from,
      messageFormat: msgFormat,
      groupId: req.params.groupId,
    });
    if (!newMsg)
      return res
        .status(401)
        .json({ success: "fail", msg: "couldn't send message" });

    res.status(201).json({ success: "true", data: newMsg });
  };

  getMessages = async (req: Request, res: Response) => {
    const { groupId } = req.params;

    if (!groupId)
      return res
        .status(400)
        .json({ success: "fail", msg: "please provide an id" });

    const messages = await groupMsgModel.find({ groupId });

    if (!messages) {
      res.status(404).json({ success: "fail", msg: "no messages yet" });
    } else {
      res.status(200).json({ success: "fail", data: messages });
    }
  };

  deleteMessage = async (req: Request, res: Response) => {
    await groupMsgModel.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: "true" });
  };

  markSeen = async (req: Request, res: Response) => {
    let message = await groupMsgModel.findById(req.params.id).select("seen");

    if (!message) {
      res.status(404).json({ success: "fail", msg: "cannot find message" });
    } else {
      //@ts-ignore
      message?.seen = true;
      message = await message.save();
      res.status(200).json({ success: "true", data: message });
    }
  };

  addReaction = async (req: Request, res: Response) => {
    let message = await groupMsgModel.findById(req.params.id);

    if (!message) {
      res.status(404).json({ success: "fail", msg: "cannot find message" });
    } else {
      message.reaction = req.body.reaction;
      message = await message.save();
      res.status(200).json({ success: "true", data: message });
    }
  };

  setAsForwarded = async (req: Request, res: Response) => {
    let message = await groupMsgModel.findById(req.params.id);

    if (!message) {
      res.status(404).json({ success: "fail", msg: "cannot find message" });
    } else {
      message.forwarded = true;
      message = await message.save();
      res.status(200).json({ success: "true", data: message });
    }
  };

  replyMessage = async (req: Request, res: Response) => {
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
    let message = await groupMsgModel.findById(req.params.id);
    //@ts-expect-error
    message?.reply.audio = audio;
    //@ts-expect-error
    message?.reply.image = image;
    //@ts-expect-error
    message?.reply.text = text;
    //@ts-expect-error
    message?.reply.from = req.body.from;
    //@ts-expect-error
    message?.reply.messageFormat = msgFormat;
    //@ts-expect-error
    message = await message?.save();
    if (!message)
      return res
        .status(401)
        .json({ success: "fail", msg: "couldn't send message" });

    res.status(201).json({ success: "true", data: message });
  };
}

export default new GroupController();
