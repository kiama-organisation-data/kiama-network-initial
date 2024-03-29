import { Request, Response } from "express";
import joiValidation from "../libs/joiValidation";
import { channelModel, createApiKeys, IChannel } from "../model/Channels.Model";
import Users from "../model/users/UsersAuth.Model";
import ChannelServices from "../services/channels/Channel.Services";
import AppResponse from "../services/index";
import channelPostModel, { IPchannel } from "../model/Posts.Channels";
import unique from "../libs/randomGen";
import { deleteFromCloud, uploadToCloud } from "../libs/cloudinary";
import Notifications from "../model/Notifications.Model";

class ChannelCntrl {
	constructor() {}

	/**
	 * Note: all routes are appended to http://localhost:port/kiama-network/api/v1
	 * @function create /channel                                                      -- post request
	 * @function getAll /channel                                                      -- get request
	 * @function getByCategory /channel/category                                      -- get request
	 * @function getByPublicKey /channel/public-key                                   -- get request
	 * @function getOne /channel/:channelId                                           -- get request
	 * @function edit /channel/:channelId                                             -- patch request
	 * @function delete /channel/:channelId                                           -- delete request
	 * @ function addAdmin /channel/:channelId                                         -- put request
	 * @function uploadCoverPhoto /channel/change-photo/:channelId                    -- patch request
	 * @function addFollowers /channel/followers/:channelId                           -- put request
	 * @function unFollow /channel/followers/:channelId                               -- delete request
	 * @function requestToBeFollower /channel/requests/:channelId                     -- put request
	 * @function getAdmins /channel/utils/admins/:channelId                           -- get request
	 * @function getRequest /channel/utils/requests/:channelId                        -- get request
	 * @function getFollowers /channel/utils/followers/:channelId                     -- get request
	 * @function lockChannel /channel/utils/lock/:channelId                           -- put request
	 * @function deActivateChannel /channel/utils/unlock/:channelId                   -- put request
	 * @function createPost /channel/post/:channelId                                  -- post request
	 * @function editPost /channel/post/:channelId                                    -- put request
	 * @function getAllPost /channel/post/:channelId                                  -- get request
	 * @function getPost /channel/post/single/:postId                                 -- get request
	 * @function deletePost /channel/post/single/:postId                              -- delete request
	 *
	 * totalRequest: 22
	 */

	create = async (req: Request, res: Response) => {
		//@ts-ignore
		const { body, user } = req;
		const { error } = joiValidation.channelsValidation(body);

		if (error) {
			return AppResponse.fail(res, error?.message);
		}
		const details = await Users.findById(user);

		try {
			const keys = await createApiKeys(details);
			const isNameAndEmail = await channelModel.findOne({
				$or: [{ name: body.name }, { email: body.email }],
			});

			if (isNameAndEmail)
				return AppResponse.fail(res, "either name or email is taken");

			const channel: IChannel = await channelModel.create({
				...body,
				...keys,
				admins: [user],
				stars: 1,
				size: 1,
			});

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
		const { page, device, sort, category, search } = req.query;
		let totalItems: number = 0;
		let serchBy = {};
		let sortBy = {};
		let tabSize: number = 6;

		const pageNo = +page || 1;

		const count = await channelModel.find().count();
		totalItems = count;

		if (category) {
			serchBy = { category };
		} else if (search) {
			const searchRgx = new RegExp(search, "ig");
			serchBy = { name: searchRgx };
		}
		switch (device) {
			case "tablet":
				tabSize = 8;
				break;
			case "laptop":
				tabSize = 10;
			case "desktop":
				tabSize = 12;
			default:
				tabSize = 6;
				break;
		}

		if (sort === "latest") {
			sortBy = { createdAt: -1 };
		} else if (sort === "newest") {
			sortBy = { createdAt: 1 };
		}

		try {
			const channels = await channelModel
				.find(serchBy)
				.skip((pageNo - 1) * tabSize)
				.select(["-privateKey", "-secretKey", "-publicKey", "-admins"])
				.limit(tabSize)
				.sort(sortBy)
				.lean();

			if (!channels) {
				return AppResponse.fail(res, "no channels yet");
			}

			AppResponse.success(res, { channels, totalItems });
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

			if (req.user !== channel?.admins[0].toString()) {
				const notificationObj = {
					user: channel?.admins[0],
					notification: "kiama channels",
					type: "channel",
					link: "http://localhost:kiama-network/api/v1/channel/" + channel?._id,
					icon: "channel icon",
				};

				await Notifications.create({
					...notificationObj,
					content: `${channel?.name} has just been updated an admin that's not you`,
				});
			}
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

			let channel = await channelModel.findByIdAndUpdate(req.params.channelId, {
				coverImage: {
					url: coverimage.secure_url,
					publicId: coverimage.public_id,
				},
			});

			if (req.user !== channel?.admins[0].toString() && channel) {
				const notificationObj = {
					user: channel?.admins[0],
					notification: "kiama channel",
					type: "channel",
					link: "http://localhost:kiama-network/api/v1/channel" + channel._id,
					icon: "channel icon",
				};
				await Notifications.create({
					...notificationObj,
					content: `${channel.name} has just been updated by an admin that's not you`,
				});
			}

			AppResponse.updated(res, "updated");
		} catch (e) {
			AppResponse.fail(res, e);
		}
	};

	delete = async (req: Request, res: Response) => {
		try {
			const channel = await channelModel.findById(req.params.channelId);
			//@ts-ignore
			await deleteFromCloud(channel?.coverImage.url);
			await channelModel.findByIdAndDelete(req.params.channelId);

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
				{ $push: { admins: newAdminId } } // if multiple then newAdminId should be an array
			);
			await Users.findByIdAndUpdate(newAdminId, {
				$push: { channels: channelId },
			}).lean();

			if (channel) {
				AppResponse.updated(res, "updated");
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
			const channel = await channelModel.findByIdAndUpdate(channelId, {
				$pull: { requests: followerId },
				$push: { followers: followerId },
				$inc: { size: 1 },
			});
			await Users.findByIdAndUpdate(followerId, {
				$push: { channels: channelId },
			});

			AppResponse.updated(res, "updated");
		} catch (e) {
			AppResponse.fail(res, e);
		}
	};

	requestToBeFollower = async (req: Request, res: Response) => {
		const { user } = req;
		const { channelId } = req.params;
		try {
			const channel = await channelModel.findByIdAndUpdate(channelId, {
				$push: { requests: user },
			});

			if (channel) {
				const notificationObj = {
					user: channel?.admins[0],
					notification: "kiama channel",
					type: "channel",
					link: "http://localhost:kiama-network/api/v1/channel" + channel._id,
					icon: "channel icon",
				};
				await Notifications.create({
					...notificationObj,
					content: `${channel.name} has a new follower request`,
				});
			}
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
			await channelModel.findByIdAndUpdate(channelId, {
				$pull: { followers: user },
				$inc: { size: -1 },
			});

			await Users.findByIdAndUpdate(user, { $pull: { channels: channelId } });

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
				.populate("admins", "name _id username avatar")
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
