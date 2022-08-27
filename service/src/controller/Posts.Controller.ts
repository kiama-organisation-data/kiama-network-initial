import { Request, Response } from "express";
import { deleteFromCloud } from "../libs/cloudinary";
import { postModel } from "../model/Posts.Model";
import AppResponse from "../services";
import MidFuncs from "../functions";

export interface IUrls {
	publicId: string;
	url: string;
}

class PostsController {
	constructor() {}

	uploadPosts = async (req: Request, res: Response) => {
		const { files, user: userId, body } = req;

		const { texts, urls } = await MidFuncs.PostLoop(files, body);

		try {
			const post = await postModel.create({
				texts,
				urls,
				userId,
			});
			AppResponse.success(res, post);
		} catch (e) {
			AppResponse.fail(res, e);
		}
	};

	getPost = async (req: Request, res: Response) => {
		const { user: userId } = req;
		const { postId } = req.query;

		try {
			const post = await postModel
				.findOne({
					$and: [{ userId }, { _id: postId }],
				})
				.lean();

			if (!post) return AppResponse.notFound(res);

			AppResponse.success(res, post);
		} catch (e) {
			AppResponse.fail(res, e);
		}
	};

	deletePost = async (req: Request, res: Response) => {
		const { user: userId } = req;
		const { postId } = req.query;

		try {
			const post = await postModel.findOne({
				$and: [{ userId }, { _id: postId }],
			});

			if (!post) return AppResponse.notFound(res);

			while (post.urls.length > 0) {
				let url: string = "";
				post.urls.forEach((obj: any) => {
					url = obj.url;
				});
				await deleteFromCloud(url);
			}

			await postModel.deleteOne({ _id: postId });
			AppResponse.updated(res, "updated");
		} catch (e) {
			AppResponse.fail(res, e);
		}
	};

	getPosts = async (req: Request, res: Response) => {
		const { userId } = req.params;

		const { tab } = req.query;

		const currentTab = tab || 1;

		try {
			const totalPosts = await postModel.find({ userId }).countDocuments();

			const posts = await postModel
				.find({ userId })
				.skip((currentTab - 1) * 1)
				.limit(1)
				.lean();

			if (totalPosts == 0) return AppResponse.notFound(res);

			AppResponse.success(res, { posts, totalPosts });
		} catch (e) {
			AppResponse.fail(res, e);
		}
	};
}

const uploadController = new PostsController();

export default uploadController;
