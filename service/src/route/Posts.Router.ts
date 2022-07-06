import { Router } from "express";
import uploadController from "../controller/Posts.Controller";

class PostsRouter {
  router: Router;

  constructor() {
    this.router = Router();
    this.routes();
  }

  routes() {
    this.router.route("/").post(uploadController.UploadFile);
  }
}

export default new PostsRouter().router;
