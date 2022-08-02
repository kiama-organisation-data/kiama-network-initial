import { Router } from "express";
import ProductController from "../../controller/collections/Product.Controller";
import shopController from "../../controller/collections/ShopController";
import { messageUploads } from "../../libs/multerConfig";
import { validateShop } from "../../middleware/validateShopOwner";

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
    this.router.route("/get-all/users-shops").get(shopController.getUsersShop);
    this.router.route("/login").post(shopController.loginToShop);

    // products
    this.router
      .route("/product/:shopId")
      .post(validateShop, messageUploads, ProductController.createProduct)
      .get(ProductController.getProducts)
      .patch(validateShop, ProductController.editProducts);
  }
}

const shopRouter = new ShopRouter().router;
export default shopRouter;
