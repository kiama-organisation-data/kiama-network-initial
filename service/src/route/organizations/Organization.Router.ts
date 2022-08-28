import { Router } from "express";
import InfoController from "../../controller/organization/Info.Controller";
import MessagesController from "../../controller/organization/Messages.Controller";
import OrganizationController from "../../controller/organization/Organization.Controller";
import { messageUploads } from "../../libs/multerConfig";

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

		this.router
			.route("/info/one")
			.get(InfoController.getInfo)
			.delete(InfoController.deleteInfo)
			.patch(InfoController.editInfo)
			.put(InfoController.viewInfo);

		// comment
		this.router
			.route("/comment")
			.post(InfoController.createComment)
			.patch(InfoController.updateComment)
			.get(InfoController.getAllComments);

		this.router
			.route("/comment/:commentId")
			.get(InfoController.getOneComment)
			.delete(InfoController.deleteComment);

		// messages

		this.router
			.route("/msgs")
			.post(messageUploads, MessagesController.sendMsg)
			.get(MessagesController.getAllMsgs);
		this.router
			.route("/msgs/one")
			.get(MessagesController.getMsg)
			.patch(MessagesController.addReply)
			.delete(MessagesController.deleteMsg);

		this.router
			.route("/msgs/one/reply")
			.patch(MessagesController.addOrRemoveReaction);
	}
}

export default new OrganizationRoute().router;
