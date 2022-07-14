import { Request, Response } from "express";
import joiValidation from "../libs/joiValidation";
import { channelModel, createApiKeys, IChannel } from "../model/Channels.Model";
import Users from "../model/UsersAuth.Model";
import ChannelServices from "../services/Channel.Services";
import AppResponse from "../services/index";

class ChannelCntrl {
  constructor() {}

  create = async (req: Request, res: Response) => {
    //@ts-ignore
    const { body, user } = req;
    const { error } = joiValidation.channelsValidation(body);

    if (error) {
      return AppResponse.fail(res, error?.message);
    }

    const adminId = await Users.findById(user).select([
      "username",
      "_id",
      "avatar",
      "channels",
    ]);
    if (adminId === null) {
      return AppResponse.notFound(res, "user not found");
    }
    let admins = [{ username: adminId?.username, userId: adminId?._id }];

    const keys = await createApiKeys(admins);
    const channel: IChannel = await channelModel.create({
      ...body,
      ...keys,
      admins,
      stars: 1,
    });

    adminId?.channels.push(channel._id);
    await adminId.save();
    try {
      AppResponse.created(res, channel);
    } catch (e) {
      AppResponse.fail(res, e);
    }
  };

  getAll = async (req: Request, res: Response) => {
    const channels = await channelModel
      .find()
      .select(["-privateKey", "-secretKey", "-publicKey", "-admins"])
      .sort({ category: -1 })
      .lean();

    if (!channels) {
      return AppResponse.fail(res, "no channels yet");
    }

    try {
      AppResponse.success(res, channels);
    } catch (e) {
      AppResponse.fail(res, e);
    }
  };

  getOne = async (req: Request, res: Response) => {
    const { channelId } = req.params;
    const channels = await channelModel
      .findOne({ _id: channelId })
      .select(["-privateKey", "-secretKey", "-publicKey", "-admins"])
      .lean();

    if (channels == null) {
      return AppResponse.notFound(res, "not found");
    }

    try {
      AppResponse.success(res, channels);
    } catch (e) {
      AppResponse.fail(res, e);
    }
  };

  edit = async (req: Request, res: Response) => {
    const { channelId } = req.params;
    const { adminId } = req.query;
    const { body } = req;

    const { error } = joiValidation.channelsEditValidation(body);

    if (error) {
      AppResponse.fail(res, error.message);
    }

    let next = false;

    const isAdmin = await ChannelServices.isAdmin(adminId);
    if (isAdmin) {
      next = true;
    }
    if (next) {
      const channel = await channelModel
        .findByIdAndUpdate(channelId, body)
        .select(["-privateKey", "-secretKey", "-publicKey", "-admins"])
        .lean();
      try {
        AppResponse.success(res, channel);
      } catch (e) {
        AppResponse.fail(res, e);
      }
    }
  };

  uploadCoverPhoto = async (req: Request, res: Response) => {
    const { file } = req;
    const { adminId } = req.query;

    if (!file) {
      return AppResponse.fail(res, "provide a valid image");
    }

    const isAdmin = await ChannelServices.isAdmin(adminId);
    if (!isAdmin) {
      return AppResponse.notPermitted(res, "");
    }

    const coverImage = { publicId: "dummy", url: file.path };
    let channel = await channelModel
      .findById(req.params.channelId)
      .select(["-privateKey", "-secretKey", "-publicKey", "-admins"]);
    if (channel !== null) {
      channel.coverImage = coverImage;
    }
    //@ts-expect-error
    channel = await channel?.save();
    try {
      AppResponse.success(res, channel);
    } catch (e) {
      AppResponse.fail(res, e);
    }
  };

  delete = async (req: Request, res: Response) => {
    const { adminId } = req.query;

    const isAdmin = await ChannelServices.isAdmin(adminId);
    if (!isAdmin) {
      return AppResponse.notPermitted(res, "");
    }
    //make sure to delete from cloudinary
    await channelModel.findByIdAndDelete(req.params.channelId);

    try {
      AppResponse.success(res, "deleted");
    } catch (e) {
      AppResponse.fail(res, e);
    }
  };

  addAdmin = async (req: Request, res: Response) => {
    const { adminId, newAdminId } = req.query;
    const isAdmin = await ChannelServices.isAdmin(adminId);
    const { channelId } = req.params;

    if (!isAdmin) {
      return AppResponse.notPermitted(res, "");
    }

    let channel = await channelModel.findById(channelId);
    const newAdmin = await Users.findById(newAdminId)
      .select(["username", "_id"])
      .lean();

    if (!newAdmin) {
      return AppResponse.notFound(res, "user does not exist");
    }
    const newAdminDetails = {
      username: newAdmin.username,
      userId: newAdmin._id,
    };
    try {
      if (channel) {
        channel.admins.push(newAdminDetails);
        channel = await channel.save();
        AppResponse.success(res, channel);
      } else {
        AppResponse.notFound(res, "channel not found");
      }
    } catch (e) {
      AppResponse.fail(res, e);
    }
  };
}

export default new ChannelCntrl();
