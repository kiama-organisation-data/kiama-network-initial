import { Router } from "express";
import PostsPagesController from "../controller/Posts.Pages.Controller";
import { messageUploads } from "../libs/multerConfig";

class PostPageRouter {
  router: Router;

  constructor() {
    this.router = Router();
    this.routes();
  }

  routes() {
    this.router.route("/").get(PostsPagesController.getAll);

    this.router
      .route("/:pageId")
      .post(messageUploads, PostsPagesController.create);
  }
}

export default new PostPageRouter().router;
