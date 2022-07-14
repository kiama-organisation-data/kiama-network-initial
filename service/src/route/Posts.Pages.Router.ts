import { Router } from "express";
import PostsPagesController from "../controller/Posts.Pages.Controller";
import { postsUploads } from "../libs/multerConfig";

class PostPageRouter {
  router: Router;

  constructor() {
    this.router = Router();
    this.routes();
  }

  routes() {
    this.router.route("/:pageId").get(PostsPagesController.getAll);

    this.router.route("/").post(postsUploads, PostsPagesController.create);

    this.router
      .route("/single/:id")
      .get(PostsPagesController.getOne)
      .patch(PostsPagesController.edit)
      .delete(PostsPagesController.deletePost);
  }
}

export default new PostPageRouter().router;
