import { Request, Response } from "express";
import { deleteFromCloud, uploadToCloud } from "../../libs/cloudinary";
import MessagesModel from "../../model/organizations/Messages.Model";
import OrganizationModel from "../../model/organizations/Organization.Model";
import AppResponse from "../../services";

class OrgMsgCntrl {
	constructor() {}

	async sendMsg(req: Request, res: Response) {
		const { user: userId, file, body } = req;

		try {
			let url: string = "";
			let publicId: string = "";
			let fileType: string = "";

			if (file) {
				const typeArr = [
					"image/jpeg",
					"image/jpg",
					"image/gif",
					"image/png",
					"audio/mp3",
					"audio/wav",
					"audio/m4a",
				];

				if (!typeArr.includes(file.mimetype)) return AppResponse.noFile(res);

				const { secure_url, public_id } = await uploadToCloud(file.path);

				url = secure_url;
				publicId = public_id;
				fileType = file.mimetype.split("/")[1];
			}

			const msg = await MessagesModel.create({
				isFile: file ? true : false,
				isText: body.text ? true : false,
				from: userId,
				orgId: body.orgId,
				fileType,
				...body,
			});
			await OrganizationModel.findByIdAndUpdate(msg.orgId, {
				$push: { messages: msg._id },
			});
			AppResponse.created(res, "created");
		} catch (e) {
			AppResponse.fail(res, e);
		}
	}

	async getMsg(req: Request, res: Response) {
		const { orgId, msgId } = req.query;

		try {
			const msg = await MessagesModel.findOne({ orgId, _id: msgId })
				.populate("reply.reactor", "name, avatar")
				.lean();
			if (!msg) return AppResponse.notFound(res);

			AppResponse.success(res, msg);
		} catch (e) {
			AppResponse.fail(res, e);
		}
	}

	async getAllMsgs(req: Request, res: Response) {
		const { tab, device, orgId } = req.query;

		let currentTab = +tab || 1;
		let tabSize = 10;
		switch (device) {
			case "laptop":
				tabSize = 15;
				break;
			case "tablet":
				tabSize = 12;
			default:
				tabSize = 10;
				break;
		}
		try {
			const msgs = await MessagesModel.find({ orgId })
				.skip((currentTab - 1) * tabSize)
				.limit(tabSize)
				.sort({ createdAt: -1 })
				.populate("seen.by", "name avatar")
				.lean();

			if (!msgs) return AppResponse.notFound(res);

			AppResponse.success(res, msgs);
		} catch (e) {
			AppResponse.fail(res, e);
		}
	}

	async addReply(req: Request, res: Response) {
		const { body, user: from } = req;

		try {
			await MessagesModel.findOneAndUpdate(
				{ _id: body.msgId, orgId: body.orgId },
				{
					$push: {
						reply: {
							from,
							text: body.text,
						},
					},
				},
				{ new: true }
			);

			AppResponse.updated(res, "updated");
		} catch (e) {
			AppResponse.fail(res, e);
		}
	}

	async deleteMsg(req: Request, res: Response) {
		const { user: from } = req;
		const { msgId, orgId } = req.query;

		try {
			const msg = await MessagesModel.findOne({ orgId, from, _id: msgId });
			if (!msg) AppResponse.notFound(res);

			if (msg?.isFile) {
				await deleteFromCloud(msg.url);
			}

			await MessagesModel.deleteOne({ _id: msg?._id });
			await OrganizationModel.findByIdAndUpdate(
				{ _id: msg?.orgId },
				{ $pull: { messages: msgId } }
			);
			AppResponse.updated(res, "updated");
		} catch (e) {
			AppResponse.fail(res, e);
		}
	}
}

export default new OrgMsgCntrl();
