import { Router } from "express";
import DraftsController from "../../controller/users/Drafts.Controller";

class DraftRouter {
	router: Router;
	constructor() {
		this.router = Router();
		this.routes();
	}

	routes() {
		this.router
			.route("/")
			.post(DraftsController.saveAsDraft)
			.get(DraftsController.getAllDrafts)
			.delete(DraftsController.deleteDrat);

		this.router.route("/one").get(DraftsController.getOneDratItem);
	}
}

export default new DraftRouter().router;
