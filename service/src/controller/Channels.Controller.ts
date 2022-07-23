import { Request, Response } from "express";
import joiValidation from "../libs/joiValidation";
import { channelModel, createApiKeys, IChannel } from "../model/Channels.Model";
import Users from "../model/UsersAuth.Model";
import ChannelServices from "../services/Channel.Services";
import AppResponse from "../services/index";
import channelPostModel, { IPchannel } from "../model/Posts.Channels";
import unique from "../libs/randomGen";

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
      size: 1,
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

  getByCategory = async (req: Request, res: Response) => {
    const { category } = req.query;
    const channel = await channelModel
      .find({ category })
      .select(["-privateKey", "-secretKey", "-publicKey", "-admins"])
      .lean();

    if (!channel) {
      return AppResponse.notFound(res, "not found");
    }

    try {
      AppResponse.success(res, channel);
    } catch (e) {
      AppResponse.fail(res, e);
    }
  };

  getByPublicKey = async (req: Request, res: Response) => {
    const { publicKey } = req.query;
    const channel = await channelModel
      .find({ publicKey })
      .select(["-privateKey", "-secretKey", "-publicKey", "-admins"])
      .lean();

    if (!channel) {
      return AppResponse.notFound(res, "not found");
    }

    try {
      AppResponse.success(res, channel);
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

  addFollowers = async (req: Request, res: Response) => {
    const { adminId, followerId } = req.query;
    const { channelId } = req.params;
    const isAdmin = await ChannelServices.isAdmin(adminId);

    if (!isAdmin) {
      return AppResponse.notPermitted(res, "");
    }

    let channel = await channelModel
      .findById(channelId)
      .select(["followers", "requests"]);

    if (!channel) {
      return AppResponse.notFound(res, "channel does not exist");
    }

    let user = await Users.findById(followerId).select([
      "channels",
      "pages",
      "groups",
      "_id",
      "size",
    ]);

    if (user === null) {
      return AppResponse.notFound(res, "user not found");
    }

    const newChannelRequest = channel.requests.filter((request) => {
      //@ts-expect-error
      request.user._id !== user._id;
    });
    channel.requests = newChannelRequest;
    channel.followers.push(user._id);
    channel.size = channel.size + 1;
    user.channels.push(channel._id);
    channel = await channel.save();
    user = await user.save();

    try {
      AppResponse.success(res, { channel });
    } catch (e) {
      AppResponse.fail(res, e);
    }
  };

  requestToBeFollower = async (req: Request, res: Response) => {
    const { channelId } = req.params;
    const { userId } = req.query;

    let channel = await channelModel
      .findById(channelId)
      .select(["followers", "requests"]);

    if (channel === null) {
      return AppResponse.notFound(res, "channel does not exist");
    }

    const user = await Users.findById(userId).select([
      "-updatedAt",
      "-password",
      "-email",
      "-role",
      "-status",
    ]);

    if (user === null) {
      return AppResponse.notFound(res, "user does not exist");
    }

    channel.requests.push({ user });
    channel = await channel.save();

    try {
      AppResponse.success(res, "your request was successful");
    } catch (e) {
      AppResponse.fail(res, e);
    }
  };

  unFollow = async (req: Request, res: Response) => {
    const { channelId } = req.params;
    const { followerId } = req.query;

    let channel = await channelModel
      .findById(channelId)
      .select(["followers", "size"]);
    const newFollowers = channel?.followers.filter(
      (follower) => follower !== followerId
    );
    if (newFollowers === undefined) {
      AppResponse.notFound(res, "user not a follower");
    } else {
      let userChannels = await Users.findById(followerId).select(["channels"]);
      const newChannels = userChannels?.channels.filter(
        (channel) => channel._id !== channelId
      );
      //@ts-expect-error
      userChannels?.channels = newChannels;
      //@ts-expect-error
      channel?.followers = newFollowers;
      //@ts-expect-error
      channel.size = channel.size - 1;
      //@ts-expect-error
      channel = await channel?.save();
      //@ts-expect-error
      userChannels = await userChannels?.save();

      try {
        AppResponse.success(res, channel);
      } catch (e) {
        AppResponse.fail(res, e);
      }
    }
  };

  // remember to make scheduling of lock and unlock
  lockChannel = async (req: Request, res: Response) => {
    const channel = await channelModel.findById(req.params.channelId);
    //@ts-expect-error
    const { user } = req;
    const creator = channel?.admins[0];

    //@ts-expect-error
    if (creator?.userId?.toString() !== user.toString()) {
      return AppResponse.notPermitted(
        res,
        "only channel creator can lock group"
      );
    }
    const result = channel?.activateLock();

    try {
      if (!result) {
        return AppResponse.fail(res, "error");
      }
      AppResponse.success(res, channel);
    } catch (e) {
      AppResponse.fail(res, e);
    }
  };

  deActivateChannel = async (req: Request, res: Response) => {
    const channel = await channelModel.findById(req.params.channelId);
    //@ts-expect-error
    const { user } = req;
    const creator = channel?.admins[0];

    //@ts-expect-error
    if (creator?.userId.toString() !== user.toString()) {
      return AppResponse.notPermitted(
        res,
        "only channel creator can unlock group"
      );
    }

    const result = channel?.deActivateLock();

    try {
      if (!result) {
        return AppResponse.fail(res, "error");
      }
      AppResponse.success(res, channel);
    } catch (e) {
      AppResponse.fail(res, e);
    }
  };

  createPost = async (req: Request, res: Response) => {
    const { channelId } = req.params;
    const { fileType } = req.query;
    //@ts-expect-error
    const { user } = req;

    const channel = await channelModel
      .findById(channelId)
      .select(["publicKey", "category"])
      .lean();

    if (channel == null) {
      return AppResponse.notFound(res, "channel not found");
    }

    const uniqueKey = unique();
    const primary = {
      channelId,
      uniqueKey,
      publicKey: channel.publicKey,
      category: channel.category,
      creator: user,
    };
    const Imagepost = {
      ...primary,
      image: {
        description: req.body.description,
        tags: req.body.tags,
        publicId: "", // will be implemented with cloudinary
        url: req.file?.path,
      },
    };

    const Videopost = {
      ...primary,
      video: {
        description: req.body.description,
        tags: req.body.tags,
        publicId: "", // will be implemented with cloudinary
        url: req.file?.path,
      },
    };
    let post: IPchannel | null | undefined;
    if (fileType === "video") {
      console.log(Videopost);
    } else if (fileType === "image") {
      post = await channelPostModel.create(Imagepost);
    } else {
      AppResponse.fail(res, "provide a valid fileType in the query");
    }

    if (!post) {
      return AppResponse.fail(res, "failed creating a post");
    }

    try {
      AppResponse.created(res, post);
    } catch (e) {
      AppResponse.fail(res, e);
    }
  };

  editPost = async (req: Request, res: Response) => {
    const { channelId } = req.params;
    const { fileType } = req.query;

    const { error } = joiValidation.channelsCreatePostValidation(req.body);

    if (error) {
      return AppResponse.fail(res, error);
    }

    let description: string = req.body.description;

    let post: IPchannel | null | undefined = await channelPostModel
      .findById(channelId)
      .select(["image", "video"]);

    if (fileType === "video") {
      //@ts-expect-error
      post?.video.description = description;
    } else if (fileType === "image") {
      //@ts-expect-error
      post?.image.description = description;
    }

    post = await post?.save();
    try {
      AppResponse.success(res, post);
    } catch (e) {
      AppResponse.fail(res, e);
    }
  };

  getAllPost = async (req: Request, res: Response) => {
    const { channelId } = req.params;

    const posts = await channelPostModel.find({ channelId }).lean();

    if (!posts) {
      return AppResponse.notFound(res, "not found");
    }

    try {
      AppResponse.success(res, posts);
    } catch (e) {
      AppResponse.fail(res, e);
    }
  };

  getPost = async (req: Request, res: Response) => {
    const { postId } = req.params;

    const post = await channelPostModel.findById(postId).lean();

    if (!post) {
      return AppResponse.notFound(res, "not found");
    }

    try {
      AppResponse.success(res, post);
    } catch (e) {
      AppResponse.fail(res, e);
    }
  };

  deletePost = async (req: Request, res: Response) => {
    const { postId } = req.params;

    await channelPostModel.findByIdAndDelete(postId);

    try {
      AppResponse.success(res, "deleted");
    } catch (e) {
      AppResponse.fail(res, e);
    }
  };
}

export default new ChannelCntrl();