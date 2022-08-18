import { Router } from "express";
import WalletController from "../controller/Wallet.Controller";

class WalletRoute {
	router: Router;
	constructor() {
		this.router = Router();
		this.routes();
	}

	routes() {
		this.router.route("/create").post(WalletController.createUserWallet);
		this.router.route("/").get(WalletController.getUserWallet);
		this.router.route("/verify").post(WalletController.verifyOwnerOfAccount);
		this.router
			.route("/toggle-suspension")
			.patch(WalletController.suspendOrUnsuspendWallet);

		this.router
			.route("/update-password")
			.patch(WalletController.updatePassword);

		this.router
			.route("/update-amount")
			.patch(WalletController.updateKiamaPointOrCoin);

		this.router
			.route("/deduct-amount")
			.patch(WalletController.deductKiamaPointOrCoin);

		this.router
			.route("/wallet/transact")
			.patch(WalletController.makeTransaction);
	}
}

export default new WalletRoute().router;
