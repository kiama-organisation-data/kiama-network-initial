import { NextFunction, Request, Response } from "express";
import {
  groupModel,
  groupMsgModel,
  IGrmsg,
  IGroup,
} from "../model/Messages.Model";
import Users from "../model/UsersAuth.Model";
import AppResponse from "../services/index";

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
      if (!imageMimeType.includes(req.file?.mimetype)) {
        return AppResponse.fail(res, "the file type is not accepted");
      }
    }

    const { id } = req.params;
    let user = await Users.findById(id).select(["username", "_id", "groups"]);

    if (!user) return AppResponse.notFound(res, "user not found");

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
      AppResponse.fail(res, "");
    } else {
      AppResponse.success(res, group);
    }
  };

  editGroup = async (req: Request, res: Response) => {
    const { id } = req.params; // admins Id

    const groupId = req.body.id;

    const isAdmin = await groupModel.findOne({ _id: groupId });

    if (!isAdmin) return AppResponse.notFound(res, "groups not found");

    //@ts-expect-error
    if (isAdmin.admin.id.toString() !== id) {
      AppResponse.notPermitted(res, "");
    } else {
      const body = req.body;
      const group = await groupModel.findByIdAndUpdate(groupId, body);

      try {
        AppResponse.success(res, group);
      } catch (e) {
        AppResponse.fail(res, e);
      }
    }
  };

  editGroupPhoto = async (req: Request, res: Response) => {
    if (!req.file) {
      return AppResponse.fail(res, "provide an image");
    }

    let group = await groupModel.findById(req.body.id);

    if (!group) {
      AppResponse.notFound(res, "group not found");
    } else {
      //@ts-expect-error
      if (group.admin.id.toString() !== id)
        return AppResponse.notPermitted(res, "");

      const imageMimeType = ["image/jpeg", "image/png", "image/jpg"];

      if (!imageMimeType.includes(req.file.mimetype))
        return AppResponse.fail(res, "not a valid file type");

      // In the future cloudinary would be used here
      //@ts-expect-error
      group.image.url = req.file.path;
      //@ts-expect-error
      group.image.publicId = "dummy"; //will be proccessed with cloudinary in the future
      group = await group.save();

      try {
        AppResponse.success(res, group);
      } catch (e) {
        AppResponse.fail(res, e);
      }
    }
  };

  deleteGroupPhoto = async (req: Request, res: Response) => {
    let group = await groupModel.findOne({ _id: req.body.id });

    if (!group) {
      AppResponse.notFound(res, "group not found");
    } else {
      //@ts-expect-error
      if (group.admin.id.toString() !== id) AppResponse.notPermitted(res, "");

      //@ts-expect-error
      group.image.url = null;
      //@ts-expect-error
      group.image.publicId = null;
      group.isImage = false;
      group = await group.save();

      try {
        AppResponse.success(res, group);
      } catch (e) {
        AppResponse.fail(res, e);
      }
    }
  };

  addMember = async (req: Request, res: Response) => {
    let group = await groupModel.findById(req.body.id);

    if (!group) {
      AppResponse.notFound(res, "group not found");
    } else {
      //@ts-expect-error
      if (group.admin.id.toString() !== req.params.id)
        return AppResponse.notPermitted(res, "");

      let user = await Users.findById(req.body.member);

      if (!user) return AppResponse.notFound(res, "user not found");
      user.groups.push(group._id);
      group.members.push(req.body.member); //req.body.member is user id;
      group.size = group.size + 1;
      group = await group.save();
      user = await user.save();

      try {
        AppResponse.success(res, group);
      } catch (e) {
        AppResponse.fail(res, e);
      }
    }
  };

  removeMember = async (req: Request, res: Response) => {
    let group = await groupModel.findById(req.body.id);
    if (!group) {
      AppResponse.notFound(res, "group not found");
    }

    //@ts-expect-error
    if (group.admin.id.toString() !== id) {
      AppResponse.notPermitted(res, "");
    } else {
      //remeber to change members to use a linked list for effeciency in query
      let memberToBeDeleted: String = "";
      //@ts-expect-error
      group.members.map((member) => {
        if (member.toString() === req.body.member) {
          memberToBeDeleted = member;
        }
      });
      //@ts-expect-error
      const deleted = await group.removeMember(memberToBeDeleted);
      if (deleted) {
        try {
          AppResponse.success(res, group);
        } catch (e) {
          AppResponse.fail(res, e);
        }
      } else {
        AppResponse.fail(res, "fail");
      }
    }
  };

  deleteGroup = async (req: Request, res: Response) => {
    await groupModel.findByIdAndDelete(req.params.id);
    try {
      AppResponse.success(res, "success");
    } catch (e) {
      AppResponse.fail(res, e);
    }
  };

  exitGroup = async (req: Request, res: Response) => {
    let user = await Users.findById(req.params.id).select("groups");

    let group = await groupModel.findById(req.body.id).select("removeMember");

    if (!user || !group) {
      AppResponse.notFound(res, "group not found");
    } else {
      const result = group.removeMember(req.params.id);
      try {
        AppResponse.success(res, result);
      } catch (e) {
        AppResponse.fail(res, e);
      }
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
        AppResponse.fail(res, "fail");
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
    if (!newMsg) return AppResponse.fail(res, "error");

    AppResponse.created(res, newMsg);
  };

  getMessages = async (req: Request, res: Response) => {
    const { groupId } = req.params;

    if (!groupId) return AppResponse.notFound(res, "id not found");

    const messages = await groupMsgModel.find({ groupId });

    if (!messages) {
      AppResponse.notFound(res, "not found");
    } else {
      AppResponse.success(res, messages);
    }
  };

  deleteMessage = async (req: Request, res: Response) => {
    await groupMsgModel.findByIdAndDelete(req.params.id);
    AppResponse.success(res, "success");
  };

  markSeen = async (req: Request, res: Response) => {
    let message = await groupMsgModel.findById(req.params.id).select("seen");

    if (!message) {
      AppResponse.notFound(res, "cannot find any message");
    } else {
      //@ts-ignore
      message?.seen = true;
      message = await message.save();

      try {
        AppResponse.success(res, message);
      } catch (e) {
        AppResponse.fail(res, e);
      }
    }
  };

  addReaction = async (req: Request, res: Response) => {
    let message = await groupMsgModel.findById(req.params.id);

    if (!message) {
      AppResponse.notFound(res, "cannot find message");
    } else {
      message.reaction = req.body.reaction;
      message = await message.save();
      AppResponse.success(res, message);
    }
  };

  setAsForwarded = async (req: Request, res: Response) => {
    let message = await groupMsgModel.findById(req.params.id);

    if (!message) {
      AppResponse.notFound(res, "cannot find message");
    } else {
      message.forwarded = true;
      message = await message.save();
      AppResponse.success(res, message);
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
        AppResponse.fail(res, "fail");
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
    if (!message) return AppResponse.notFound(res, "message not found");

    AppResponse.created(res, message);
  };
}

export default new GroupController();
