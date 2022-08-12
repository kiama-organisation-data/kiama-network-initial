import { Request, Response } from 'express'
import Profiles, { IProfile } from '../../model/users/Profiles.Model'
import Users, { IUser } from '../../model/users/UsersAuth.Model';
import AppResponse from "../../services/index";
import sortData from "../../middleware/utils";

class ProfileController {

    constructor() { }
    // =========================================================================
    // Add a new profile
    // =========================================================================
    // @desc    : Add a new profile
    // @route   : POST /api/v1/profile
    // @access  : Private
    create(req: Request, res: Response): void {
        Profiles.create(req.body)
            .then(profile => {
                AppResponse.created(res, profile);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }


    // =========================================================================
    // update a profile
    // =========================================================================
    // @desc    : Update a profile
    // @route   : PUT /api/v1/profile/:id
    // @access  : Private
    // @param   : id
    update(req: any, res: Response): void {
        Profiles.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true, upsert: true })
            .then(profile => {
                AppResponse.success(res, profile);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }

    // =========================================================================
    // delete a profile
    // =========================================================================
    // @desc    : Delete profile
    // @route   : DELETE /api/v1/profile/:id
    // @access  : Private
    // @param   : id
    deleteOne(req: Request, res: Response): void {
        Profiles.deleteOne({ _id: req.params.id })
            .then(profile => {
                AppResponse.success(res, profile);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }


    // =========================================================================
    // Get all profiles
    // =========================================================================
    // @desc    : Get all profiles
    // @route   : GET /api/v1/profile
    // @access  : Private
    // @params   : search, perPage, page, sortBy, sortDesc, user, select
    getAll(req: Request, res: Response): void {
        let query;
        Profiles.find(query || {})
            .then(profile => {
                const {
                    search = "",
                    perPage = 10,
                    page = 1,
                    sortBy = "createdAt",
                    sortDesc = false,
                    about = "",
                    select = "all",
                } = req.query;

                const queryLowered = search.toLowerCase();

                const filteredData = profile.filter((item) => {
                    return (
                        // search
                        (
                            item.about?.toLowerCase().includes(queryLowered)
                        )
                        &&
                        // Filter
                        item.about.toString() === (about.toString() || item.about.toString())
                    );
                });

                const sortedData = filteredData.sort(sortData.sortCompare(sortBy));
                if (sortDesc === "true") {
                    sortedData.reverse();
                }

                // result to show
                const dataFinal = sortData.selectFields(sortedData, select);
                AppResponse.success(res, sortData.paginateArray(dataFinal, perPage, page), filteredData.length);
            })
            .catch(err => {
                console.log(err);
                AppResponse.fail(res, err);
            });
    }


    // =========================================================================
    // Get one profile
    // =========================================================================
    // @desc    : Get one profile
    // @route   : GET /api/v1/profile/:id
    // @access  : Private
    // @param   : id
    getOne(req: any, res: Response): void {
        Profiles.findOne({ user: req.params.id })
            .then(profile => {
                AppResponse.success(res, profile);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }



    // =========================================================================
    // follow a profile
    // =========================================================================
    // @desc    : follow a profile
    // @route   : POST /api/v1/profile/:id/follow
    // @access  : Private
    // @param   : id
    followUser = async (req: any, res: Response, next: any): Promise<void> => {
        const userToFollow: any = await Profiles.findOne({ user: req.params.id });
        const user: any = await Profiles.findOne({ user: req.user });

        if (!userToFollow) {
            AppResponse.fail(res, "User not found");
        } else {
            if (user.following.includes(userToFollow._id)) {
                const indexFollowing = user.following.indexOf(userToFollow._id);
                user.following.splice(indexFollowing, 1);

                const indexFollower = userToFollow.followers.indexOf(user._id);
                userToFollow.followers.splice(indexFollower, 1);

                await user.save();
                await userToFollow.save();

                AppResponse.success(res, "Unfollowed");
            } else {
                user.following.push(userToFollow._id);
                userToFollow.followers.push(user._id);

                await user.save();
                await userToFollow.save();

                AppResponse.success(res, "Followed");
            }
        }

    }

    // =========================================================================
    // Get all followers
    // =========================================================================
    // @desc    : Get all followers for user by everyone
    // @route   : GET /api/v1/profile/:id/followers
    // @access  : Private
    // @param   : id
    getFollowers = async (req: any, res: Response, next: any): Promise<void> => {
        const user: any = await Profiles.findOne({ user: req.params.id }).select("followers followersType");
        if (!user) {
            AppResponse.fail(res, "User not found");
        } else {
            if (user.followersType === "public") {
                const followers = await Profiles.find({ _id: { $in: user.followers } })
                    .select("user")
                    .populate(
                        {
                            path: "user",
                            select: "name avatar",
                        }
                    );

                AppResponse.success(res, followers);
            } else {
                AppResponse.fail(res, "You can't see followers");
            }
        }
    }

    // =========================================================================
    // Get all following
    // =========================================================================
    // @desc    : Get all following for user by everyone
    // @route   : GET /api/v1/profile/:id/following
    // @access  : Private
    // @param   : id
    getFollowing = async (req: any, res: Response, next: any): Promise<void> => {
        const user: any = await Profiles.findOne({ user: req.params.id }).select("following followingType");
        if (!user) {
            AppResponse.fail(res, "User not found");
        } else {
            if (user.followingType === "public") {
                const following = await Profiles.find({ _id: { $in: user.following } })
                    .select("user")
                    .populate(
                        {
                            path: "user",
                            select: "name avatar",
                        }
                    );

                AppResponse.success(res, following);
            } else {
                AppResponse.fail(res, "You can't see following");
            }
        }
    }
}

const profilesController = new ProfileController()

export default profilesController




