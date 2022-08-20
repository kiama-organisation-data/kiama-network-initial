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

		this.router
			.route("/get-organization")
			.get(OrganizationController.getOrganization);

		this.router
			.route("/edit-organization")
			.patch(OrganizationController.editOrganization);

		this.router
			.route("/organization")
			.delete(OrganizationController.deleteOrganization)
			.patch(OrganizationController.removeMembers)
			.put(OrganizationController.addMembers)
			.get(OrganizationController.getAllOrganizations);

		this.router.route("/update").patch(OrganizationController.updateExecutive);
		// Info
		this.router.route("/info").post(InfoController.createInfo);

		this.router.route("/info/one").get(InfoController.getInfo);
	}
}

export default new OrganizationRoute().router;
