import { Router } from "express";
import CentreController from "../../controller/collections/Centre.Controller";

class CentreRoute {
  router: Router;
  constructor() {
    this.router = Router();
    this.routes();
  }
  routes() {
    this.router
      .route("/collection-requests")
      .get(CentreController.getAllRequest);

    this.router
      .route("/collection-request")
      .get(CentreController.getOneRequest)
      .patch(CentreController.approveRequest)
      .delete(CentreController.rejectRequest);
  }
}

export default new CentreRoute().router;
