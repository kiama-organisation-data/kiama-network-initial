import { Router } from "express";
import uploadController from "../controller/Posts.Controller";
import validationToken from "../libs/verifyToken";

class PostsRouter {
  router: Router;

  constructor() {
    this.router = Router();
    this.routes();
  }
  /**
   * @route "/" uploads a post with a maximum of 5 post
   * @route "/:id" gets an id as a param used for fetching, deleting and editing a post
   * @route "/all/:id" fetches all the users posts.
   */
  routes() {
    this.router
      .route("/")
      .post(validationToken.TokenValidation, uploadController.uploadPost);
    this.router
      .route("/:id")
      .delete(validationToken.TokenValidation, uploadController.deletePost)
      .get(validationToken.TokenValidation, uploadController.getPost)
      .patch(uploadController.editSinglePost);
    this.router
      .route("/all/:id")
      .get(validationToken.TokenValidation, uploadController.getUsersPosts);
  }
}

export default new PostsRouter().router;
