import { Router } from "express";
import AdsController from "../../controller/business/Ads.Controller";
import { messageUploads } from "../../libs/multerConfig";

class AdsRoute {
	router: Router;
	constructor() {
		this.router = Router();
		this.routes();
	}

	routes() {
		this.router
			.route("/")
			.post(messageUploads, AdsController.uploadAnAdd)
			.get(AdsController.getAllAds);

		this.router.route("/activate").post(AdsController.payForAd);

		this.router
			.route("/:adId")
			.get(AdsController.getAnAd)
			.delete(AdsController.deleteAnAd);
	}
}

export default new AdsRoute().router;
