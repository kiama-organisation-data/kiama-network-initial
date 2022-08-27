import { Router } from "express";
import uploadController from "../controller/Posts.Controller";
import { postsUploads } from "../libs/multerConfig";
import messageHelpers from "../middleware/messageHelpers";

class PostsRouter {
	router: Router;

	constructor() {
		this.router = Router();
		this.routes();
	}
	/**
	 * @function routes "/" uploads a post with a maximum of 5 post
	 * @function routes
	 * @function routes
	 */
	routes() {
		this.router.route("/").post(postsUploads, uploadController.uploadPosts);

		this.router
			.route("/single")
			.get(uploadController.getPost)
			.delete(uploadController.deletePost);

		this.router.route("/:userId").get(uploadController.getPosts);
	}
}

export default new PostsRouter().router;
