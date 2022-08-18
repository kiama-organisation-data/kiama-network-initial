import { Request, Response } from "express";
import redisConfig from "../../libs/redis";
import DraftsModel, { IDraft } from "../../model/users/Drafts.Model";
import AppResponse from "../../services";
// import

/**
 * @function saveAsDraft   /draft                   -- post request
 * @function getAllDrafts  /draft                   -- get request
 * @function getOneDratItem /draft/one                  -- get request
 * @function deleteDraft     /draft                  -- delete request
 *
 * totalRequest: 4
 */

class DraftController {
	constructor() {}

	async saveAsDraft(req: Request, res: Response) {
		const { user: userId } = req;
		const { text, type } = req.body;
		//@ts-ignore
		const key = `${userId.toString()}-draft`;

		let data: any;

		try {
			switch (type) {
				case "temporary":
					data = await redisConfig.addToRedis(key, text, 60 * 60 * 24);
					break;
				case "permanent":
					//@ts-ignore
					data = await DraftsModel.create({
						userId,
						text,
					});
				default:
					"";
					break;
			}
			AppResponse.created(res, data);
		} catch (e) {
			AppResponse.fail(res, e);
		}
	}

	async getAllDrafts(req: Request, res: Response) {
		const { user: userId } = req;

		let totalDraft: number = 0;

		try {
			const count = await DraftsModel.find({ userId }).count();
			const getFromRedis = await redisConfig.getValueFromRedis(
				//@ts-ignore
				userId.toString() + "-draft"
			);

			if (getFromRedis) totalDraft = 1;

			const drafts = await DraftsModel.find({ userId });

			totalDraft += count;

			const data = [...drafts, getFromRedis];

			if (!getFromRedis)
				return AppResponse.success(res, { drafts, totalDraft });

			AppResponse.success(res, { data, totalDraft });
		} catch (e) {
			AppResponse.fail(res, e);
		}
	}

	async getOneDratItem(req: Request, res: Response) {
		const { user: userId } = req;
		const { type, draftId } = req.query;

		let draft: IDraft | string | null = null;
		try {
			switch (type) {
				case "temporary":
					draft = await redisConfig.getValueFromRedis(
						//@ts-ignore
						userId.toString() + "-draft"
					);
					break;
				case "permanent":
					draft = await DraftsModel.findOne({ userId, _id: draftId });
				default:
					"";
					break;
			}
			if (!draft) return AppResponse.notFound(res);
			AppResponse.success(res, draft);
		} catch (e) {
			AppResponse.fail(res, e);
		}
	}

	async deleteDrat(req: Request, res: Response) {
		const { user: userId } = req;
		const { draftId, type } = req.query;

		try {
			switch (type) {
				case "temporary":
					//@ts-ignore
					await redisConfig.removeFromRedis(userId.toString() + "-draft");
				case "permanent":
					await DraftsModel.findOneAndDelete({ userId, draftId });
				default:
					"";
					break;
			}
			AppResponse.updated(res, "updated");
		} catch (e) {
			AppResponse.fail(res, e);
		}
	}
}

export default new DraftController();
