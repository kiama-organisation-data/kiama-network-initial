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
   * @function routes "/:id" gets an id as a param used for fetching, deleting and editing a post
   * @function routes "/all/:id" fetches all the users posts.
   */
  routes() {
    this.router.route("/").post(postsUploads, uploadController.uploadPost);

    this.router
      .route("/:id")
      .delete(uploadController.deletePost)
      .get(uploadController.getPost)
      .patch(messageHelpers.isId, uploadController.editSinglePost);

    this.router
      .route("/all/:id")
      .get(messageHelpers.isId, uploadController.getUsersPosts);
  }
}

export default new PostsRouter().router;
