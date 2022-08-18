import { Request, Response } from "express";
import postModel, { IPost } from "../model/Posts.Model";
import Users from "../model/users/UsersAuth.Model";
import AppResponse from "../services/index";

class PostsController {
	constructor() {}

	// =========================================================================
	// upload posts with a maximum number of 5 files
	// =========================================================================
	/**
	 * @key publicId will be set in the future to run with cloudinary
	 */
	uploadPost = (req: Request, res: Response) => {
		if (!req.files)
			return res
				.status(401)
				.json({ success: "fail", msg: "pick a file for upload" });

		let title: string = "";
		let filesUrl: Array<string> = [];
		let filesType: Array<string> = [];

		// @ts-ignore
		req.files.map((i: any) => {
			filesUrl.push(i.path);
			filesType.push(i.mimetype);
		});

		if (req.body.title) title = req.body.title;
		postModel
			.create({
				title,
				userId: req.body,
				fileType: filesType,
				fileUrl: filesUrl,
				publicId: null,
			})
			.then((result) => {
				AppResponse.created(res, result);
			})
			.catch((err) => {
				AppResponse.fail(res, err);
			});
	};

	// =========================================================================
	// delete a single post by id
	// =========================================================================
	/**
	 * @conditional - after this, cloudinary delete file will be implemented in the future
	 */
	deletePost = (req: Request, res: Response) => {
		const { id } = req.params;

		if (!id) return res.status(400).send("cannot delete without post id");
		postModel
			.findByIdAndDelete(id)
			.then((result) => {
				if (result) AppResponse.success(res, "post deleted");
			})
			.catch((err) => {
				AppResponse.fail(res, err);
			});
	};

	// =========================================================================
	// get a single post
	// =========================================================================
	/**
	 * @future - in the future, this fucntion will be changed to use async await
	 */
	getPost = (req: Request, res: Response) => {
		const { id } = req.params;

		if (!id) return res.status(400).send("cannot delete without post id");
		postModel
			.findById(id)
			.then((result) => {
				if (!result) return AppResponse.notFound(res, "post no longer exist");
				AppResponse.success(res, result);
			})
			.catch((err) => {
				AppResponse.fail(res, err);
			});
	};

	// =========================================================================
	// get all the posts that belongs to a single user
	// =========================================================================
	async getUsersPosts(req: Request, res: Response): Promise<any> {
		const getAllPosts = async () => getPosts(req.params.id, res);
		const returnValue = await getAllPosts();

		if (!returnValue)
			return AppResponse.notFound(res, "cannot find user's post");

		AppResponse.success(res, returnValue);
	}

	// =========================================================================
	// edit a single post
	// =========================================================================
	async editSinglePost(req: Request, res: Response): Promise<any> {
		const usersPost = await postModel.findByIdAndUpdate(req.params.id, {
			title: req.body.title,
		});

		if (!usersPost) return AppResponse.fail(res, "couldn't update users post");

		AppResponse.success(res, "updated successfully");
	}
}

// =========================================================================
// A stand alone function used for fetching all the posts for a single user
// =========================================================================
async function getPosts(id: any, res: any) {
	const user = await Users.findById(id);

	if (!user) return { success: false };

	const posts = await postModel
		.find({ userId: user._id })
		.sort({ updatedAt: "desc" })
		.limit(5);

	if (!posts) return { success: false };
	return posts;
}

const uploadController = new PostsController();

export default uploadController;
