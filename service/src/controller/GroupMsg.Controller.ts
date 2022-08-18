import { Request, Response } from "express";
import { deleteFromCloud, uploadToCloud } from "../libs/cloudinary";
import {
	groupModel,
	groupMsgModel,
	IGrmsg,
	IGroup,
} from "../model/Messages.Model";
import Users from "../model/users/UsersAuth.Model";
import AppResponse from "../services/index";

// Some valuable information on the methods

/**
 * @function createGroup will create a new group setting the creator as admin an member
 * @function editGroup will only edit other group fileds except image
 * @function editGroupPhoto will edit the group photo accepting only jpg, jpeg and png.
 * @function deleteGroupPhoto will set the publicId and url of group image to null
 * @param isAdmin remember to set this to a middleware in the future
 * @function deleteGroup deletes a groip
 * @function sendMessage in the future a timeStamp will be used to calculate seconds before
 * not allowing for deleting anymore
 */

// All the routes for the methods in this controller.
// Note: the routes are appended to http://localhost:port/kiama-network/v1

/**
 * @function createGroup /msg/group                                      -- post request
 * @function editGroup /msg/group                                        -- patch request
 * @function addMember /msg/group/add                                    -- post request
 * @function removeMember /msg/group/remove                              -- delete request
 * @function sendMessage /msg/group/msg                                  -- post request
 * @function getMessages /msg/group/msg/:groupId                         -- get request
 * @function addReaction /msg/group/msg/add-reaction/:messageId          -- patch request
 * @function replyMessage /msg/group/msg/reply/:messageId                -- put request
 * @function deleteGroupPhoto /msg/group                                 -- delete request
 * @function editGroupPhoto /msg/group                                   -- put request
 * @function removeMember /msg/group/remove                              -- delete request
 * @function  deleteMessage /msg/group/msg/:id                           -- delete request
 * @function markSeen /msg/group/msg/mark-seen/:id                       --patch request
 * @function setAsForwarded /msg/group/msg/forwarded/:id                 --patch request
 *
 * totalRoutes : 14
 */

class GroupController {
	constructor() {}

	/**
	 * Up until next comment at line 200+, here only handles group functionalities
	 * and not messaging in group
	 */

	createGroup = async (req: Request, res: Response) => {
		const imageMimeType = ["image/jpeg", "image/png", "image/jpg"];
		let image = { publicId: "", url: "" };

		try {
			if (req.file) {
				if (!imageMimeType.includes(req.file?.mimetype)) {
					return AppResponse.fail(res, "the file type is not accepted");
				}
				const upload = await uploadToCloud(req.file.path);
				image = { publicId: upload.public_id, url: upload.secure_url };
			}

			const { user } = req;

			const details = await Users.findById(user);
			if (!details) return AppResponse.fail(res, "user not found");

			const group: IGroup = await groupModel.create({
				...req.body,
				members: [details._id],
				admins: [details._id],
				image,
				isImage: req.file ? true : false,
				size: 1,
			});
			details.groups.push(group._id);
			await details.save();
			AppResponse.created(res, group);
		} catch (e) {
			AppResponse.fail(res, e);
		}
	};

	editGroup = async (req: Request, res: Response) => {
		const groupId = req.body.groupId;

		const body = req.body;
		try {
			await groupModel.findByIdAndUpdate(groupId, body);

			AppResponse.success(res, "updated");
		} catch (e) {
			AppResponse.fail(res, e);
		}
	};

	editGroupPhoto = async (req: Request, res: Response) => {
		if (!req.file) {
			return AppResponse.fail(res, "provide an image");
		}

		try {
			let group = await groupModel.findById(req.body.groupId);

			const imageMimeType = ["image/jpeg", "image/png", "image/jpg"];

			if (!imageMimeType.includes(req.file.mimetype))
				return AppResponse.fail(res, "not a valid file type");

			// @ts-ignore
			const currentUrl = group?.image?.url;
			await deleteFromCloud(currentUrl);
			const upload = await uploadToCloud(req.file.path);

			if (!group) return AppResponse.notFound(res);

			group.image = {
				publicId: upload.public_id,
				url: upload.secure_url,
			};

			await group.save();
			AppResponse.success(res, "updated");
		} catch (e) {
			AppResponse.fail(res, e);
		}
	};

	deleteGroupPhoto = async (req: Request, res: Response) => {
		try {
			let group = await groupModel.findById(req.body.groupId);

			if (!group) {
				return AppResponse.notFound(res, "group not found");
			}
			// @ts-ignore
			const currentUrl = group.image.url;
			await deleteFromCloud(currentUrl);
			group.image = {
				publicId: null,
				url: null,
			};
			group.isImage = false;
			await group.save();
			AppResponse.success(res, "updated");
		} catch (e) {
			AppResponse.fail(res, e);
		}
	};

	addMember = async (req: Request, res: Response) => {
		const { userId, groupId } = req.body;

		try {
			let group = await groupModel.findById(groupId);

			if (!group) return AppResponse.notFound(res, "group not found");

			await Users.findByIdAndUpdate(userId, { $push: { groups: group._id } });

			await groupModel.findByIdAndUpdate(groupId, {
				$push: { members: userId },
				$inc: { size: 1 },
			});

			AppResponse.success(res, "updated");
		} catch (e) {
			AppResponse.fail(res, e);
		}
	};

	removeMember = async (req: Request, res: Response) => {
		const { groupId, userId } = req.body;
		let group = await groupModel.findById(groupId);

		if (!group) return AppResponse.notFound(res, "group not found");

		try {
			await Users.findByIdAndUpdate(userId, { $pull: { groups: groupId } });

			await groupModel.findByIdAndUpdate(groupId, {
				$inc: { size: -1 },
				$pull: { members: userId },
			});

			AppResponse.success(res, "updated");
		} catch (e) {
			AppResponse.fail(res, e);
		}
	};

	// TO.DO :check for a better alternative to this looping
	deleteGroup = async (req: Request, res: Response) => {
		const members = await groupModel
			.findById(req.params.id)
			.select(["members", "_id"]);
		//@ts-ignore
		for (var i; i <= members.length; i++) {
			//@ts-ignore
			await Users.findByIdAndUpdate(members[i], {
				$pull: { groups: members?._id },
			});
		}
		await groupModel.findByIdAndDelete(req.params.id);
		try {
			AppResponse.success(res, "success");
		} catch (e) {
			AppResponse.fail(res, e);
		}
	};

	exitGroup = async (req: Request, res: Response) => {
		const response = await this.removeMember(req, res);
		return response;
	};

	/**
	 * From here down begins the implementation of all the messaging functionalities
	 */

	sendMessage = async (req: Request, res: Response) => {
		let audio: object = {};
		let image: object = {};
		let text: string = "";
		let data: object = {};
		let msgFormat: string = "";

		const audioMimeType = ["audio/mp3", "audio/wmp", "audio/mpeg"];
		const imageMimeType = ["image/jpeg", "image/pdf", "image/gif"];

		if (req.file) {
			const upload = await uploadToCloud(req.file.path);
			data = {
				publicId: upload.public_id,
				url: upload.secure_url,
			};
		}

		if (req.file) {
			if (audioMimeType.includes(req.file.mimetype)) {
				audio = { ...data };
				msgFormat = "audio";
			} else if (imageMimeType.includes(req.file.mimetype)) {
				image = { ...data };
				msgFormat = "image";
			} else {
				AppResponse.fail(res, "fail, file type not allowed");
			}
		} else {
			if (req.body) {
				text = req.body.text;
				msgFormat = "text";
			}
		}
		try {
			const newMsg: IGrmsg = await groupMsgModel.create({
				message: {
					text,
					audio,
					image,
				},
				sender: req.body.from,
				messageFormat: msgFormat,
				groupId: req.body.groupId,
			});
			if (!newMsg) return AppResponse.fail(res, "error");
			AppResponse.created(res, newMsg);
		} catch (e) {
			AppResponse.fail(res, e);
		}
	};

	// remeber to paginatePOST
	getMessages = async (req: Request, res: Response) => {
		const tab = req.query.tab || 1;
		let totalMsgs = 0;
		const perTab = req.query.device === "mobile" ? 15 : 20;

		const { groupId } = req.params;

		if (!groupId) return AppResponse.notFound(res, "id not found");

		const count = await groupMsgModel.find({ groupId }).countDocuments();

		const messages = await groupMsgModel
			.find({ groupId })
			.skip((+tab - 1) * perTab)
			.limit(perTab)
			.sort({ createdAt: -1 })
			.lean();

		totalMsgs = count;

		if (!messages) {
			AppResponse.notFound(res, "not found");
		} else {
			AppResponse.success(res, { messages, totalMsgs });
		}
	};

	deleteMessage = async (req: Request, res: Response) => {
		await groupMsgModel.findByIdAndDelete(req.params.id);
		AppResponse.success(res, "success");
	};

	markSeen = async (req: Request, res: Response) => {
		const { id } = req.params;
		try {
			await groupMsgModel.findByIdAndUpdate(id, { $set: { seen: true } });

			AppResponse.success(res, "updated");
		} catch (e) {
			AppResponse.fail(res, e);
		}
	};

	addReaction = async (req: Request, res: Response) => {
		//@ts-ignore
		const { user } = req;
		const { reaction } = req.query;

		const reactArray = ["wow", "laughing", "clap", "love"];

		if (!reactArray.includes(reaction))
			return AppResponse.fail(res, "not a valid reaction");

		try {
			await groupMsgModel.findByIdAndUpdate(req.params.id, {
				$push: { reactions: { reactions: reaction, reactors: user } },
			});
			AppResponse.success(res, "updated");
		} catch (e) {
			AppResponse.fail(res, e);
		}
	};

	/**
	 * I have stopped updates here, TO.DO: remember to test the method above
	 */
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
	// Tested and working perfectly
	replyMessage = async (req: Request, res: Response) => {
		let audio: object = {};
		let image: object = {};
		let text: string = "";
		let msgFormat: string = "";

		const audioMimeType = ["audio/mp3", "audio/wmp", "audio/mpeg"];
		const imageMimeType = ["image/jpeg", "image/pdf", "image/gif"];

		try {
			if (req.file) {
				const { secure_url, public_id } = await uploadToCloud(req.file.path);
				const upload = { publicId: public_id, url: secure_url };
				if (audioMimeType.includes(req.file.mimetype)) {
					audio = {
						upload,
					};
					msgFormat = "audio";
				} else if (imageMimeType.includes(req.file.mimetype)) {
					image = {
						upload,
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

			const message = await groupMsgModel.findByIdAndUpdate(
				req.params.id,
				{
					$push: {
						reply: {
							image,
							audio,
							text,
							messageFormat: msgFormat,
							from: req.body.from,
						},
					},
				},
				{ new: true }
			);

			AppResponse.success(res, message);
		} catch (e) {
			AppResponse.fail(res, e);
		}
	};
}

export default new GroupController();
