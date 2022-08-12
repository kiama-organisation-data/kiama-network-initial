import { Request, Response } from "express";
import Users from "../../model/users/UsersAuth.Model";
import Profiles, { IProfile } from '../../model/users/Profiles.Model'
import AppResponse from "../../services/index";

class UserUtilCntrl {
  constructor() { }

  getAllUserJobPortals = async (req: Request, res: Response) => {

    const { user } = req;
    try {
      const userPortals = await Users.findById(user)
        .populate("jobPortals", "_id coverPhoto name description admins")
        .select(["jobPortals"])
        .lean();

      if (!userPortals) return AppResponse.notFound(res);

      AppResponse.success(res, userPortals);
    } catch (e) {
      AppResponse.fail(res, e);
    }
  };

  getAllUserChannels = async (req: Request, res: Response) => {

    const { user } = req;
    try {
      const channels = await Users.findById(user)
        .populate(
          "channels",
          " _id name description admins stars size coverImage "
        )
        .select(["channels"])
        .lean();

      if (!channels) return AppResponse.notFound(res);

      AppResponse.success(res, channels);
    } catch (e) {
      AppResponse.fail(res, e);
    }
  };

  getAllUserPages = async (req: Request, res: Response) => {
    //@ts-ignore
    const { user } = req;

    try {
      const pages = await Users.findById(user)
        .populate("pages", "image name description moderators")
        .select(["pages"])
        .lean();

      if (!pages) {
        AppResponse.notFound(res);
      } else {
        AppResponse.success(res, pages);
      }
    } catch (e) {
      AppResponse.fail(res, e);
    }
  };

  getAllUserFriends = async (req: Request, res: Response) => {

    const { user } = req;
    try {
      const friends = await Users.findById(user)
        .populate("friends", "name.first name.last")
        .select(["friends"])
        .lean();

      if (!friends) return AppResponse.notFound(res);
      AppResponse.success(res, friends, friends.friends.length);
    } catch (e) {
      AppResponse.fail(res, e);
    }
  };

  getAllUsersVisitedShops = async (req: Request, res: Response) => {

    const { user } = req;

    try {
      const shops = await Users.findById(user)
        .populate("shops", "name brand _id")
        .lean();

      if (!shops) return AppResponse.notFound(res);

      const shopObj = { shops: shops.shops };

      AppResponse.success(res, shopObj);
    } catch (e) {
      AppResponse.fail(res, e);
    }
  };

  // =========================================================================
  // Get all followers
  // =========================================================================
  // @desc    : Get all followers for user by user
  // @route   : GET /api/v1/user/followers
  // @access  : Private
  // @param   : id
  getFollowers = async (req: any, res: Response, next: any): Promise<void> => {
    const user: any = await Profiles.findOne({ user: req.user }).select("followers followersType");
    if (!user) {
      AppResponse.fail(res, "User not found");
    } else {
      const followers = await Profiles.find({ _id: { $in: user.followers } })
        .select("user")
        .populate(
          {
            path: "user",
            select: "name avatar",
          }
        );

      AppResponse.success(res, followers);
    }
  }

  // =========================================================================
  // Get all following
  // =========================================================================
  // @desc    : Get all following for user by user
  // @route   : GET /api/v1/user/following
  // @access  : Private
  // @param   : id
  getFollowing = async (req: any, res: Response, next: any): Promise<void> => {
    const user: any = await Profiles.findOne({ user: req.user }).select("following followingType");
    if (!user) {
      AppResponse.fail(res, "User not found");
    } else {
      const following = await Profiles.find({ _id: { $in: user.following } })
        .select("user")
        .populate(
          {
            path: "user",
            select: "name avatar",
          }
        );

      AppResponse.success(res, following);
    }
  }
}

export default new UserUtilCntrl();
