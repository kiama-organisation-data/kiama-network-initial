import { Router } from "express";
import PagesController from "../controller/Pages.Controller";
import { messageUploads } from "../libs/multerConfig";
import PageServices from "../services/pages/Page.Services";

class PagesRouter {
  router: Router;

  constructor() {
    this.router = Router();
    this.routes();
  }

  routes() {
    this.router.route("/").get(PagesController.getPages);

    this.router
      .route("/:id")
      .patch(PagesController.edit)
      .delete(PagesController.deletePage)
      .post(messageUploads, PagesController.create)
      .get(PagesController.getPage);

    this.router
      .route("/cover-image/:id")
      .put(messageUploads, PagesController.changePhoto);

    this.router.route("/add/:id").put(PagesController.addModerator);

    this.router.route("/remove/:id").delete(PagesController.removeModerator);

    this.router.route("/add-like/:id").put(PageServices.addLikes);

    this.router.route("/remove-like/:id").delete(PageServices.removeLikes);

    this.router.route("/add/visitor/:id").put(PagesController.addVisitor);

    this.router
      .route("/all/visitors/:pageId")
      .get(PagesController.getAllVisitors);
  }
}

export default new PagesRouter().router;
