import shopServices from "../../services/collections/Shop.Services";
import AppResponse from "../../services/index";
import { Request, Response } from "express";
import { uploadToCloud } from "../../libs/cloudinary";
import joiValidation from "../../libs/joiValidation";
import shopModel from "../../model/collections/Shop.Model";
import redisConfig from "../../libs/redis";
import Users from "../../model/UsersAuth.Model";

class ShopCntl {
  constructor() { }

  async createShop(req: Request, res: Response) {

    const { body, user, file } = req;
    if (!file) return AppResponse.noFile(res);

    const { error } = joiValidation.shopCreationValidation(body);

    if (error) return AppResponse.fail(res, error);

    try {
      const upload = await uploadToCloud(file.path);
      const brand = {
        publicId: upload.public_id,
        url: upload.secure_url,
      };

      const shop = await shopServices.createNew({ brand, body, owner: user });
      await Users.findByIdAndUpdate(user, {
        $push: { "collections.shop": shop._id },
      });
      AppResponse.created(res, shop);
    } catch (e) {
      AppResponse.fail(res, e);
    }
  }

  async getSingleShop(req: Request, res: Response) {
    const { shopId } = req.query;

    if (!shopId) return AppResponse.fail(res, "please provide shopId");

    try {
      const shop = await shopModel
        .findById(shopId)
        .populate("owner", "name avatar gender")
        .lean();

      if (!shop) return AppResponse.notFound(res);

      AppResponse.success(res, shop);
    } catch (e) {
      AppResponse.fail(res, e);
    }
  }

  async getShopsProducts(req: Request, res: Response) {
    const { shopId } = req.query;

    if (!shopId) return AppResponse.fail(res, "please provide shopId");

    try {
      const shop = await shopModel.findById(shopId).populate("products").lean();
      //   console.log(shop);
      if (!shop) return AppResponse.notFound(res);
      AppResponse.success(res, shop.products);
    } catch (e) {
      AppResponse.fail(res, e);
    }
  }

  async getShopCustomers(req: Request, res: Response) {
    const { shopId } = req.query;

    if (!shopId) return AppResponse.fail(res, "please provide shopId");

    try {
      const shop = await shopModel
        .findById(shopId)
        .populate("customers", "name avatar email")
        .lean();

      if (!shop) return AppResponse.notFound(res);
      AppResponse.success(res, shop.customers);
    } catch (e) {
      AppResponse.fail(res, e);
    }
  }

  async updateShopDetails(req: Request, res: Response) {
    const { shopId } = req.body;
    try {
      const shop = await shopServices.updateById(shopId, req.body);

      if (!shop) return AppResponse.throwError(res);

      AppResponse.updated(res, "updated");
    } catch (e) {
      AppResponse.fail(res, e);
    }
  }

  async addCustomer(req: Request, res: Response) {

    const { user } = req;
    const { shopId } = req.query;

    try {
      const add = shopServices.addCustomer(user, shopId);
      if (!add) return AppResponse.throwError(res);

      AppResponse.updated(res, "updated");
    } catch (e) {
      AppResponse.fail(res, e);
    }
  }

  async getShopToken(req: Request, res: Response) {
    const { shopId, secretKey } = req.query;

    if (!shopId || !secretKey)
      return AppResponse.fail(res, "provide fields in query params");

    const token = await shopServices.developeCredentials(shopId, secretKey);

    const add = await redisConfig.addToRedis(
      shopId.toString(),
      token,
      60 * 60 * 24
    );

    if (!add) return AppResponse.fail(res, "failed to save to redis");

    AppResponse.success(res, {
      token,
      secretKey,
      msg: "token expires in 24 hours",
    });
  }

  async loginToShop(req: Request, res: Response) {

    const { user } = req;
    const { shopId } = req.body;

    const loginKey = await redisConfig.getValueFromRedis(shopId.toString());

    if (loginKey) return AppResponse.success(res, { token: loginKey });

    try {
      const userM = Users.findById(user).populate(
        "collections.shop",
        "credentials"
      );
      console.log(userM);
      // @ts-expect-error
      if (!userM.credentials) return AppResponse.throwError(res);

      const shop = await shopModel.findById(shopId);

      if (!shop?.credentials) return AppResponse.throwError(res);
      // @ts-ignore
      if (userM.collections.shop.secretKey !== shop?.credentials.secretKey) {
        return AppResponse.notPermitted(res, "not owner");
      }

      const token = await shopServices.developeCredentials(
        shopId,
        // @ts-ignore
        userM.collections.shop.secretKey
      );

      const add = await redisConfig.addToRedis(
        shopId.toString(),
        token,
        60 * 60 * 24
      );

      if (!add) return AppResponse.fail(res, "failed to save to redis");

      AppResponse.success(res, {
        token,
        msg: "token expires in 24 hours",
      });
    } catch (e) {
      AppResponse.fail(res, e);
    }
  }

  async getUsersShop(req: Request, res: Response) {

    const { user } = req;
    try {
      const shops = await shopModel
        .find({ owner: user })
        .lean()
        .sort({ createdAt: -1 });
      if (!shops) return AppResponse.notFound(res, "no shops for user");
      AppResponse.success(res, shops);
    } catch (e) {
      AppResponse.fail(res, e);
    }
  }
}

const shopController = new ShopCntl();

export default shopController;
