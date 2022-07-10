import { Request, Response } from "express";
import { groupModel, IGroup } from "../model/Messages.Model";
import Users from "../model/UsersAuth.Model";

/**
 * @function createGroup will create a new group setting the creator as admin an member
 * in the future cloudinary will be used for the image processing
 * also, replacing members with doublyLinked list rather than arrays
 * @function editGroup will only edit other group fileds except image
 * @function editGroupPhoto will edit the group photo accepting only jpg, jpeg and png.
 * @function deleteGroupPhoto will set the publicId and url of group image to null
 * @param isAdmin remember to set this to a middleware in the future
 */

class GroupController {
  constructor() {}

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
    const user = await Users.findById(id).select(["username", "_id"]);

    if (!user)
      return res.status(404).json({ success: "fail", msg: "user not found" });

    const group = await groupModel.create({
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
    });

    if (!group) {
      res.status(400).json({ success: "fail" });
    } else {
      res.status(201).json({ success: "true", data: group });
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

    const { id } = req.params; //admin's id

    if (!id)
      return res
        .status(400)
        .json({ success: "false", msg: "please provide an id" });

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
    const { id } = req.params;

    if (!id)
      return res
        .status(400)
        .json({ success: "fail", msg: "please provide an id" });

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
    const { id } = req.params;
    if (!id)
      return res
        .status(400)
        .json({ success: "fail", msg: "pls provide an id" });

    let group = await groupModel.findById(req.body.id);

    if (!group) {
      res.status(404).json({ success: "fail", msg: "group not found" });
    } else {
      //@ts-expect-error
      if (group.admin.id.toString() !== id)
        return res.status(400).json({ success: "fail", msg: "not permitted" });

      const user = await Users.findById(req.body.member);

      if (!user)
        return res.status(404).json({ success: "fail", msg: "user not found" });

      group.members.push(req.body.member); //req.body.member is user id;
      group = await group.save();
      res.status(200).json({ success: "true", data: group });
    }
  };

  removeMember = async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id)
      return res
        .status(400)
        .json({ success: "fail", msg: "please provide an id" });

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
        res
          .status(200)
          .json({ success: "true", data: group, memberToBeDeleted });
      } else {
        res.status(400).send({ success: "fail" });
      }
    }
  };
}

/**
 * users can send request
 * admin can remove members
 * mebers can exit group
 */

export default new GroupController();
