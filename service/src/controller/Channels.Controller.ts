import { Request, Response } from "express";
import joiValidation from "../libs/joiValidation";
import { channelModel, createApiKeys, IChannel } from "../model/Channels.Model";
import Users from "../model/UsersAuth.Model";
import ChannelServices from "../services/Channel.Services";
import AppResponse from "../services/index";
import channelPostModel, { IPchannel } from "../model/Posts.Channels";
import unique from "../libs/randomGen";
import { deleteFromCloud, uploadToCloud } from "../libs/cloudinary";

// remeber to update current line 240above to using pull and push
class ChannelCntrl {
  constructor() { }

  create = async (req: Request, res: Response) => {
    //@ts-ignore
    const { body, user, details } = req;
    const { error } = joiValidation.channelsValidation(body);

    if (error) {
      return AppResponse.fail(res, error?.message);
    }
    const keys = await createApiKeys(details);
    const channel: IChannel = await channelModel.create({
      ...body,
      ...keys,
      admins: [user],
      stars: 1,
      size: 1,
    });
    try {
      await Users.findByIdAndUpdate(
        user,
        { $push: { channels: channel._id } },
        { new: true }
      ).select(["_id", "channels"]);

      AppResponse.created(res, channel);
    } catch (e) {
      AppResponse.fail(res, e);
    }
  };

  getAll = async (req: Request, res: Response) => {
    // remember to set-up for query
    try {
      const channels = await channelModel
        .find()
        .select(["-privateKey", "-secretKey", "-publicKey", "-admins"])
        .sort({ createdAt: -1 })
        .lean();

      if (!channels) {
        return AppResponse.fail(res, "no channels yet");
      }

      AppResponse.success(res, channels);
    } catch (e) {
      AppResponse.fail(res, e);
    }
  };

  getOne = async (req: Request, res: Response) => {
    const { channelId } = req.params;
    try {
      const channels = await channelModel
        .findOne({ _id: channelId })
        .select(["-privateKey", "-secretKey", "-publicKey", "-admins"])
        .lean();

      if (channels == null) {
        return AppResponse.notFound(res, "not found");
      }

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
    const { body } = req;
    const { channelId } = req.params;

    const { error } = joiValidation.channelsEditValidation(body);

    if (error) {
      AppResponse.fail(res, error.message);
    }

    try {
      const channel = await channelModel
        .findByIdAndUpdate(channelId, body, { new: true })
        .select(["-privateKey", "-secretKey", "-publicKey", "-admins"])
        .lean();

      AppResponse.success(res, channel);
    } catch (e) {
      AppResponse.fail(res, e);
    }
  };

  uploadCoverPhoto = async (req: Request, res: Response) => {
    const { file } = req;

    if (!file) {
      return AppResponse.fail(res, "provide a valid image");
    }

    try {
      const coverimage = await uploadToCloud(file.path);

      let channel = await channelModel
        .findByIdAndUpdate(
          req.params.channelId,
          {
            coverImage: {
              url: coverimage.secure_url,
              publicId: coverimage.public_id,
            },
          },
          { new: true }
        )
        .select(["-privateKey", "-secretKey", "-publicKey", "-admins"]);
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
    const { newAdminId } = req.query;
    const { channelId } = req.params;

    try {
      let channel = await channelModel.findByIdAndUpdate(
        channelId,
        { $push: { admins: newAdminId } },
        { new: true }
      );
      await Users.findByIdAndUpdate(
        newAdminId,
        { $push: { channels: channelId } },
        { new: true }
      ).lean();

      if (channel) {
        AppResponse.success(res, channel);
      } else {
        AppResponse.notFound(res, "channel not found");
      }
    } catch (e) {
      AppResponse.fail(res, e);
    }
  };

  addFollowers = async (req: Request, res: Response) => {
    const { followerId } = req.query;
    const { channelId } = req.params;

    try {
      const channel = await channelModel.findByIdAndUpdate(
        channelId,
        {
          $pull: { requests: followerId },
          $push: { followers: followerId },
          $inc: { size: 1 },
        },
        { new: true }
      );
      await Users.findByIdAndUpdate(
        followerId,
        { $push: { channels: channelId } },
        { new: true }
      );

      AppResponse.success(res, channel);
    } catch (e) {
      AppResponse.fail(res, e);
    }
  };

  requestToBeFollower = async (req: Request, res: Response) => {

    const { user } = req;
    const { channelId } = req.params;
    try {
      await channelModel
        .findByIdAndUpdate(
          channelId,
          { $push: { requests: user } },
          { new: true }
        )
        .select(["followers", "requests"]);

      AppResponse.success(res, "your request was successful");
    } catch (e) {
      AppResponse.fail(res, e);
    }
  };

  unFollow = async (req: Request, res: Response) => {
    //@ts-ignore
    const { user } = req;
    const { channelId } = req.params;

    try {
      await channelModel.findByIdAndUpdate(
        channelId,
        { $pull: { followers: user }, $inc: { size: -1 } },
        { new: true }
      );

      await Users.findByIdAndUpdate(
        user,
        { $pull: { channels: channelId } },
        { new: true }
      );

      AppResponse.success(res, "user successfully unfollowed");
    } catch (e) {
      AppResponse.fail(res, e);
    }
  };

  // remember to make scheduling of lock and unlock
  lockChannel = async (req: Request, res: Response) => {

    const { user } = req;
    try {
      const channel = await channelModel.findById(req.params.channelId);
      const creator = channel?.admins[0];
      // @ts-ignore
      if (creator?.toString() !== user.toString()) {
        return AppResponse.notPermitted(
          res,
          "only channel creator can lock group"
        );
      }
      const result = channel?.activateLock(req.query.period);

      if (!result) {
        return AppResponse.fail(res, "error");
      }
      AppResponse.success(res, "lock activated");
    } catch (e) {
      AppResponse.fail(res, e);
    }
  };

  deActivateChannel = async (req: Request, res: Response) => {

    const { user } = req;
    try {
      const channel = await channelModel.findById(req.params.channelId);
      const creator = channel?.admins[0];
      // @ts-ignore
      if (creator?.toString() !== user.toString()) {
        return AppResponse.notPermitted(
          res,
          "only channel creator can unlock group"
        );
      }

      const result = channel?.deActivateLock();

      if (!result) {
        return AppResponse.fail(res, "error");
      }
      AppResponse.success(res, "lock de-activated");
    } catch (e) {
      AppResponse.fail(res, e);
    }
  };

  sendReport = async (req: Request, res: Response) => {
    const { channelId } = req.params;

    const { user } = req;
    // remeber to deal with report model
  };

  deleteReport = async (req: Request, res: Response) => {
    const { reportId } = req.query;
    const { channelId } = req.params;
    // remeber to deal with report model
  };

  getAdmins = async (req: Request, res: Response) => {
    const { channelId } = req.params;

    try {
      const channel = await channelModel
        .findById(channelId)
        .populate("admins", "name _id username ")
        .select(["admins"])
        .lean();

      if (!channel) return AppResponse.notFound(res);

      AppResponse.success(res, channel);
    } catch (e) {
      AppResponse.fail(res, e);
    }
  };

  getRequest = async (req: Request, res: Response) => {
    const { channelId } = req.params;

    try {
      const requests = await channelModel
        .findById(channelId)
        .populate("requests", "name _id username avatar")
        .select(["requests"])
        .lean();

      if (!requests) return AppResponse.notFound(res);

      AppResponse.success(res, requests);
    } catch (e) {
      AppResponse.fail(res, e);
    }
  };

  getFollowers = async (req: Request, res: Response) => {
    const { channelId } = req.params;

    try {
      const followers = await channelModel
        .findById(channelId)
        .populate("followers", "name _id username avatar")
        .select(["followers"])
        .lean();

      if (!followers) return AppResponse.notFound(res);

      AppResponse.success(res, followers);
    } catch (e) {
      AppResponse.fail(res, e);
    }
  };

  // =========================================================================
  // from here, channel post functionalities begin
  // =========================================================================

  createPost = async (req: Request, res: Response) => {
    const { channelId } = req.params;
    const { fileType } = req.body;

    const { user } = req;

    try {
      const channel = await channelModel
        .findById(channelId)
        .select(["publicKey", "category"])
        .lean();

      if (channel == null) {
        return AppResponse.notFound(res, "channel not found");
      }

      //@ts-ignore
      const upload = await uploadToCloud(req.file?.path);

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
          publicId: upload.public_id,
          url: upload.secure_url,
        },
      };

      const Videopost = {
        ...primary,
        video: {
          description: req.body.description,
          tags: req.body.tags,
          publicId: upload.public_id,
          url: upload.secure_url,
        },
      };
      let post: IPchannel | null | undefined;
      if (fileType === "video") {
        post = await channelPostModel.create(Videopost);
      } else if (fileType === "image") {
        post = await channelPostModel.create(Imagepost);
      } else {
        AppResponse.fail(res, "provide a valid fileType in the body");
      }

      if (!post) {
        return AppResponse.fail(res, "failed creating a post");
      }

      AppResponse.created(res, post);
    } catch (e) {
      AppResponse.fail(res, e);
    }
  };

  editPost = async (req: Request, res: Response) => {
    const { channelId } = req.params;
    const { fileType } = req.body;

    const { error } = joiValidation.channelsCreatePostValidation(req.body);

    if (error) {
      return AppResponse.fail(res, error);
    }

    let description: string = req.body.description;
    try {
      let post: IPchannel | null | undefined = await channelPostModel
        .findById(channelId)
        .select(["image", "video"]);

      if (fileType === "video") {
        // @ts-ignore
        post?.video.description = description;
      } else if (fileType === "image") {
        // @ts-ignore
        post?.image.description = description;
      }

      post = await post?.save();
      AppResponse.success(res, post);
    } catch (e) {
      AppResponse.fail(res, e);
    }
  };

  getAllPost = async (req: Request, res: Response) => {
    const { channelId } = req.params;
    const { error } = joiValidation.channelQueryValidation(req.query);

    if (error) return AppResponse.fail(res, error);

    const { page, sortBy, device } = req.query;
    let sort: object;
    let totalItems: number;
    const currentPage = page || 1;
    const perPage = device === "mobile" ? 15 : 20;

    if (sortBy === "latest" || "") {
      sort = { createdAt: -1 };
    } else if (sortBy === "oldest") {
      sort = { createdAt: 1 };
    }

    try {
      const count = await channelPostModel.find().countDocuments();
      const posts = await channelPostModel
        .find({ channelId })
        .skip((+currentPage - 1) * perPage)
        .limit(perPage)
        //@ts-ignore
        .sort(sort)
        .lean();

      totalItems = count;
      if (count === 0) {
        return AppResponse.notFound(res, "no posts yet");
      }

      AppResponse.success(res, { totalItems, posts });
    } catch (e) {
      AppResponse.fail(res, e);
    }
  };

  getPost = async (req: Request, res: Response) => {
    const { postId } = req.params;

    try {
      const post = await channelPostModel.findById(postId).lean();

      if (!post) {
        return AppResponse.notFound(res, "not found");
      }

      AppResponse.success(res, post);
    } catch (e) {
      AppResponse.fail(res, e);
    }
  };

  deletePost = async (req: Request, res: Response) => {
    const { postId } = req.params;

    try {
      await channelPostModel.findByIdAndDelete(postId);

      AppResponse.success(res, "deleted");
    } catch (e) {
      AppResponse.fail(res, e);
    }
  };
}

export default new ChannelCntrl();
