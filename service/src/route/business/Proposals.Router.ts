import { Router } from "express";
import ProposalController from "../../controller/business/Proposal.Controller";

class AdsRoute {
	router: Router;
	constructor() {
		this.router = Router();
		this.routes();
	}

	routes() {
		this.router
			.route("/")
			.post(ProposalController.createProposal)
			.get(ProposalController.getProposal)
			.delete(ProposalController.deleteProposal);

		this.router.route("/:userId").get(ProposalController.getProposals);
	}
}

export default new AdsRoute().router;
