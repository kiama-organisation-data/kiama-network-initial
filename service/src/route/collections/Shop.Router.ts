import { Router } from "express";
import shopController from "../../controller/collections/ShopController";
import { messageUploads } from "../../libs/multerConfig";

class ShopRouter {
  router: Router;
  constructor() {
    this.router = Router();
    this.routes();
  }

  routes() {
    this.router.route("/").post(messageUploads, shopController.createShop);

    this.router
      .route("/one")
      .get(shopController.getSingleShop)
      .patch(shopController.updateShopDetails);

    this.router.route("/add-customer").patch(shopController.addCustomer);
    this.router.route("/products").get(shopController.getShopsProducts);
    this.router.route("/customers").get(shopController.getShopCustomers);
    this.router.route("/generate-token").get(shopController.getShopToken);
  }
}

const shopRouter = new ShopRouter().router;
export default shopRouter;
