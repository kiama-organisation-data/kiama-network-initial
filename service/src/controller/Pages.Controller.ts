import { Request, Response } from "express";
import pageModel from "../model/Pages.Model";
import PageServices from "../services/pages/Page.Services";
import AppResponse from "../services/index";
import Users from "../model/users/UsersAuth.Model";
import { deleteFromCloud, uploadToCloud } from "../libs/cloudinary";

/**
 * While testing, remeber to comment routes and resolve all paginations
 */

class PagesController {
	constructor() {}

	create = async (req: Request, res: Response) => {
		try {
			const isFile = PageServices.checkFile(req, res);
			let image: object = {};

			//@ts-ignore
			const { secure_url, public_id } = await uploadToCloud(req.file?.path);
			image = { url: secure_url, publicId: public_id };

			if (isFile) {
				const page = await pageModel.create({
					...req.body,
					moderators: [req.params.id],
					creator: req.params.id,
					image,
				});

				await Users.findByIdAndUpdate(req.params.id, {
					$push: { pages: page._id },
				});

				AppResponse.created(res, page);
			}
		} catch (e) {
			AppResponse.fail(res, e);
		}
	};

	edit = async (req: Request, res: Response) => {
		try {
			const isModerator = await PageServices.isModerator(req, res);

			if (!isModerator)
				return AppResponse.notPermitted(res, "user is not a user");

			const page = await pageModel.findByIdAndUpdate(
				req.body.pageId,
				req.body,
				{
					new: true,
				}
			);

			AppResponse.success(res, page);
		} catch (e) {
			AppResponse.fail(res, e);
		}
	};

	changePhoto = async (req: Request, res: Response) => {
		const isFile = PageServices.checkFile(req, res);

		try {
			if (isFile) {
				//@ts-ignore
				const { secure_url, public_id } = await uploadToCloud(req.file?.path);

				const image = { publicId: public_id, url: secure_url };

				await pageModel.findByIdAndUpdate(req.params.id, { image });

				AppResponse.updated(res, "updated");
			}
		} catch (e) {
			AppResponse.fail(res, e);
		}
	};

	deletePage = async (req: Request, res: Response) => {
		const isCreator = await PageServices.isCreator(req, res);

		if (isCreator.success) {
			try {
				const page = await pageModel.findById(req.body.pageId);
				//@ts-ignore
				await deleteFromCloud(page?.image.url);

				await Users.findByIdAndUpdate(page?._id, {
					$pull: { page: page?._id },
				});

				pageModel.deleteOne({ _id: page?._id });

				AppResponse.success(res, "deleted");
			} catch (e) {
				AppResponse.fail(res, e);
			}
		} else {
			AppResponse.notPermitted(res, "");
		}
	};

	addModerator = async (req: Request, res: Response) => {
		const isModerator = await PageServices.isModerator(req, res);

		if (isModerator.success) {
			try {
				isModerator.page?.moderators.push(req.body.moderator);
				// @ts-ignore
				isModerator.page = await isModerator.page.save();

				await Users.findOneAndUpdate(
					{ _id: req.body.moderator },
					{ $push: { pages: isModerator.page._id } }
				);

				AppResponse.updated(res, "updated");
			} catch (e) {
				AppResponse.fail(res, e);
			}
		} else {
			AppResponse.fail(res, "an error occured");
		}
	};

	removeModerator = async (req: Request, res: Response) => {
		const isCreator = await PageServices.isCreator(req, res);

		if (isCreator.success) {
			const { moderatorId } = req.body;

			try {
				await pageModel.findOneAndUpdate(
					{ creator: req.params.id },
					{ $pull: { moderators: moderatorId } }
				);

				AppResponse.updated(res, "updated");
			} catch (e) {
				AppResponse.fail(res, e);
			}
		} else {
			AppResponse.notPermitted(res, "");
		}
	};

	addVisitor = async (req: Request, res: Response) => {
		//@ts-ignore
		const { user } = req;
		try {
			const userId = user;

			await pageModel.findByIdAndUpdate(req.params.id, {
				$push: { visitors: userId },
			});

			AppResponse.success(res, "updated");
			//   }
		} catch (error) {
			AppResponse.fail(res, error);
		}
	};

	getPage = async (req: Request, res: Response) => {
		try {
			const page = await pageModel.findById(req.params.id);

			AppResponse.success(res, page);
		} catch (e) {
			AppResponse.notFound(res, "not found");
		}
	};

	// remember to paginate
	getPages = async (req: Request, res: Response) => {
		try {
			const pages = await pageModel.find().sort({ createdAt: 1 });

			AppResponse.success(res, pages);
		} catch (e) {
			AppResponse.notFound(res, "not found");
		}
	};

	// remeber to paginate
	getAllVisitors = async (req: Request, res: Response) => {
		try {
			const visitors = await pageModel
				.findOne({ pageId: req.params.pageId })
				.select(["visitors"]);

			// @ts-ignore
			if (visitors?.visitors?.length > 1) {
				AppResponse.success(res, visitors);
			} else {
				AppResponse.notFound(res, "you have no vsitors yet");
			}
		} catch (e) {
			AppResponse.fail(res, "an error occured");
		}
	};
}

export default new PagesController();
