import { Request, Response } from "express";
import { deleteFromCloud, uploadToCloud } from "../../libs/cloudinary";
import { InfoCommentModel } from "../../model/comments/Organization.Model";
import InfoModel, { IInfo } from "../../model/organizations/Info.Model";
import OrganizationModel from "../../model/organizations/Organization.Model";
import AppResponse from "../../services";
import OrganizationServices from "../../services/organization/Organization.Services";

class InfoCntrl {
	constructor() {}

	async createInfo(req: Request, res: Response) {
		const { file, body, user: userId } = req;

		let image = {};
		if (file) {
			const arrayMimeTypes = [
				"image/jpeg",
				"image/jpg",
				"image/png",
				"video/mp4",
				"video/mpeg",
				"video/avi",
			];

			if (!arrayMimeTypes.includes(file.mimetype))
				return AppResponse.noFile(res);

			const { public_id, secure_url } = await uploadToCloud(file.path);

			image = { publicId: public_id, url: secure_url };
		}

		try {
			const fileType = file?.mimetype.split("/");
			const info: IInfo = await InfoModel.create({
				...body,
				...image,
				creator: userId,
				fileType: fileType ? fileType[0] : "none",
				isFile: file ? true : false,
				organization: [body.id],
			});

			await OrganizationModel.findByIdAndUpdate(body.id, {
				$push: { info: info._id },
			});
			AppResponse.created(res, info);
		} catch (e) {
			AppResponse.fail(res, e);
		}
	}

	async getInfo(req: Request, res: Response) {
		const { id } = req.query;

		try {
			const info = await InfoModel.findById(id)
				.populate("views.viewers", "name avatar")
				.lean();

			if (!info) return AppResponse.notFound(res);

			AppResponse.success(res, info);
		} catch (e) {
			AppResponse.fail(res, e);
		}
	}

	async editInfo(req: Request, res: Response) {
		const { body } = req;

		try {
			const info = await InfoModel.findByIdAndUpdate(body.id, body);

			if (!info) return AppResponse.fail(res, "could not edit info");

			AppResponse.updated(res, "updated");
		} catch (e) {
			AppResponse.fail(res, e);
		}
	}

	async deleteInfo(req: Request, res: Response) {
		const { id } = req.query;

		try {
			const info = await InfoModel.findById(id);

			if (!info) return AppResponse.notFound(res);

			if (info.isFile) {
				await deleteFromCloud(info.url);
			}

			await OrganizationModel.findByIdAndUpdate(info.organization, {
				$pull: { info: id },
			});
			await InfoModel.findByIdAndDelete(id);
			AppResponse.updated(res, "updated");
		} catch (e) {
			AppResponse.fail(res, e);
		}
	}

	async viewInfo(req: Request, res: Response) {
		const { id } = req.query;
		const { user } = req;

		try {
			const info = await InfoModel.findByIdAndUpdate(id, {
				$push: { "views.viewers": user },
				$inc: { "views.counts": 1 },
			});
			AppResponse.updated(res, "updated");
		} catch (e) {
			AppResponse.fail(res, e);
		}
	}

	// -----------------------------------------------------------//
	// comment functionalities
	// -----------------------------------------------------------//

	async createComment(req: Request, res: Response) {
		const { user } = req;
		const { parentId, infoId, comment } = req.body;

		try {
			let newComment = new InfoCommentModel({
				author: user,
				infoId,
				comment,
			});

			if (parentId) {
				const pComment = await InfoModel.findOne({
					_id: infoId,
					comments: parentId,
				});

				if (!pComment) return AppResponse.notFound(res);
			}

			newComment.parentId = parentId;
			await InfoCommentModel.findByIdAndUpdate(
				parentId,
				{
					$inc: { totalReplies: 1 },
					$push: { replies: newComment._id },
				},
				{
					new: true,
				}
			);

			newComment = await newComment.save();

			await InfoModel.findByIdAndUpdate(infoId, {
				$inc: { commentCount: 1 },
				$push: { comments: newComment._id },
			});
			AppResponse.created(res, newComment);
		} catch (e) {
			AppResponse.fail(res, e);
		}
	}

	getOneComment = async (req: Request, res: Response) => {
		const { commentId } = req.params;

		try {
			const comment = await OrganizationServices.findCommentById(commentId);

			if (!comment) return AppResponse.notFound(res);

			AppResponse.success(res, comment);
		} catch (e) {
			AppResponse.fail(res, e);
		}
	};

	updateComment = async (req: Request, res: Response) => {
		const { comment, commentId } = req.body;

		try {
			await OrganizationServices.findCommentByIdAndUpdate({
				comment,
				commentId,
			});

			AppResponse.updated(res, "updated");
		} catch (e) {
			AppResponse.fail(res, e);
		}
	};

	getAllComments = async (req: Request, res: Response) => {
		const { tab, sortBy, infoId } = req.query;

		try {
			const { totalComments, comments } =
				await OrganizationServices.getAllComments(tab, sortBy, infoId);

			if (totalComments === 0) return AppResponse.notFound(res);

			AppResponse.success(res, { totalComments, comments });
		} catch (e) {
			AppResponse.fail(res, e);
		}
	};

	deleteComment = async (req: Request, res: Response) => {
		const { commentId } = req.params;

		const comment = await InfoCommentModel.findById(commentId);

		if (!comment) {
			return AppResponse.notFound(res);
		}

		const { parentId, infoId } = comment;

		try {
			const post = await InfoModel.findById(infoId);

			// @ts-ignore
			const { comments, commentCount, creator } = post;

			if (!comments.length && commentCount < 1) {
				return AppResponse.fail(res, "no comments");
			} else if (creator.toString() !== req.user) {
				return AppResponse.notPermitted(res, "not permitted");
			}

			if (parentId) {
				await InfoCommentModel.findByIdAndUpdate(
					parentId,
					{ $pull: { replies: comment._id }, $inc: { totalReplies: -1 } },
					{ new: true }
				);
			}

			const updatedPost = await InfoModel.findByIdAndUpdate(
				{ _id: comment.infoId },
				{ $pull: { comments: commentId }, $inc: { commentCount: -1 } },
				{ new: true }
			).lean();

			await InfoCommentModel.deleteOne({ _id: commentId });
			AppResponse.success(res, updatedPost);
		} catch (e) {
			AppResponse.fail(res, e);
		}
	};
}

export default new InfoCntrl();
