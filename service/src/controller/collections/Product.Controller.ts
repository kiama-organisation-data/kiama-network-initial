import { Request, Response } from "express";
import { deleteFromCloud, uploadToCloud } from "../../libs/cloudinary";
import joiValidation from "../../libs/joiValidation";
import productModel, { IProduct } from "../../model/collections/Product.Model";
import shopModel from "../../model/collections/Shop.Model";
import AppResponse from "../../services/index";

class ProductCntrl {
  constructor() { }

  async createProduct(req: Request, res: Response) {
    const shopId = req.get("x-shop-id");
    const body = req.body;

    const { error } = joiValidation.productCreationValidation(body);

    if (!req.file) return AppResponse.noFile(res);
    if (error) return AppResponse.fail(res, error);

    try {
      const { public_id, secure_url } = await uploadToCloud(req.file.path);

      let newPrice: String;

      if (body.discount > 0) {
        const p = Math.floor((+body.initPrice * body.discount) / 100);
        newPrice = (+body.initPrice - p).toString();
      } else {
        newPrice = body.initPrice;
      }

      const data = {
        ...body,
        image: {
          publicId: public_id,
          url: secure_url,
        },
        shopId,
        newPrice,
        specs: {
          color: body.color,
          extraInfo: body.extraInfo,
        },
      };
      const product = await productModel.create(data);
      await shopModel.findByIdAndUpdate(shopId, {
        $push: { products: product._id },
      });
      AppResponse.created(res, product);
    } catch (e) {
      AppResponse.fail(res, e);
    }
  }

  async getProducts(req: Request, res: Response) {
    const { shopId } = req.params;
    const { page, sortBy, search } = req.query;

    const currentPage: number = +page || 1;
    const perPage = 6;
    let totalProducts: number = 0;
    let sortObj: object = {};
    let searchObj: object = {};

    if (sortBy == "newest" || !sortBy) {
      sortObj = { updatedAt: -1 };
    } else if (sortBy == "oldest") {
      sortObj = { updatedAt: 1 };
    }

    if (search == "name") {
      const searchAlgo = new RegExp(sortBy, "ig");
      searchObj = { name: searchAlgo };
    } else if (search == "category") {
      searchObj = { category: search };
    }

    try {
      const count = await productModel.find({ shopId }).countDocuments();
      totalProducts = count;

      const products = await productModel
        .find({ $and: [{ shopId }, searchObj] })
        .skip((currentPage - 1) * perPage)
        .limit(perPage)
        .sort(sortObj)
        .lean();

      if (!products) return AppResponse.notFound(res);

      AppResponse.success(res, products);
    } catch (e) {
      AppResponse.fail(res, e);
    }
  }

  async editProducts(req: Request, res: Response) {
    const { body } = req;
    const { error } = joiValidation.productEditValidation(body);

    if (error) return AppResponse.fail(res, error);

    try {
      await productModel.findByIdAndUpdate(body.productId, body);
      return AppResponse.updated(res, "updated");
    } catch (e) {
      AppResponse.fail(res, e);
    }
  }

  async deleteProduct(req: Request, res: Response) {
    const { producId } = req.query;

    try {
      const product = await productModel.findById(producId).select(["image"]);
      if (!product) return AppResponse.notFound(res);

      // @ts-ignore
      await deleteFromCloud(product.image.url);
      await productModel.deleteOne({ _id: producId });
      AppResponse.success(res, "deleted successfully");
    } catch (e) {
      AppResponse.fail(res, e);
    }
  }

  async getOneProduct(req: Request, res: Response) {
    const { producId } = req.query;

    try {
      const product = await productModel.findById(producId).lean();

      AppResponse.success(res, product);
    } catch (e) {
      AppResponse.fail(res, e);
    }
  }

  async addToCart(req: Request, res: Response) { }

  async removeFromCart(req: Request, res: Response) { }

  async getCart(req: Request, res: Response) { }

  async makeOrder(req: Request, res: Response) { }

  async chargeCard(req: Request, res: Response) { }
}

export default new ProductCntrl();
