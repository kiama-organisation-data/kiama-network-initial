import { Router } from "express";
import PagesController from "../controller/Pages.Controller";
import { messageUploads } from "../libs/multerConfig";
import validationToken from "../libs/verifyToken";

class PagesRouter {
  router: Router;

  constructor() {
    this.router = Router();
    this.routes();
  }

  routes() {
    this.router
      .route("/")
      .post(
        validationToken.TokenValidation,
        messageUploads,
        PagesController.create
      );
    this.router
      .route("/:id")
      .patch(PagesController.edit)
      .delete(PagesController.deletePage);
    this.router
      .route("/cover-image/:id")
      .put(messageUploads, PagesController.changePhoto);
    this.router
      .route("/add/:id")
      .put(validationToken.TokenValidation, PagesController.addModerator);
  }
}

export default new PagesRouter().router;
