import { Router } from "express";
import InfoController from "../../controller/organization/Info.Controller";
import OrganizationController from "../../controller/organization/Organization.Controller";

class OrganizationRoute {
	router: Router;

	constructor() {
		this.router = Router();
		this.routes();
	}

	routes() {
		// Organization
		this.router
			.route("/create-organization")
			.post(OrganizationController.createOrganization);

		// Info
		this.router.route("/info").post(InfoController.createInfo);
	}
}

export default new OrganizationRoute().router;
