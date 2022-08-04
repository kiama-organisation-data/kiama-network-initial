import { Request, Response } from "express";
import { deleteFromCloud, uploadToCloud } from "../../libs/cloudinary";
import joiValidation from "../../libs/joiValidation";
import productModel, { IProduct } from "../../model/collections/Product.Model";
import shopModel from "../../model/collections/Shop.Model";
import Users, { IUser } from "../../model/UsersAuth.Model";
import ProductServices from "../../services/collections/Product.Services";
import AppResponse from "../../services/index";

class ProductCntrl {
  constructor() {}

  async createProduct(req: Request, res: Response) {
    const shopId = req.get("x-shop-id");
    const body = req.body;

    const { error } = joiValidation.productCreationValidation(body);

    if (!req.file) return AppResponse.noFile(res);
    if (error) return AppResponse.fail(res, error);

    try {
      const { public_id, secure_url } = await uploadToCloud(req.file.path);

      let newPrice: String;
      /**
       * block below comment checks if there is a discount
       * if there is, it subtracts the discount percentage from the initailPrice
       * and sets a newPrice
       */
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

  /**
   *
   * @param req.query will contain the page, sortBy and search fields
   * the page field carries a number to donate what page user is on
   * the sortBy field will contain the method for sorting i.e by newest, oldest
   * the search field provides how the user wants to get products
   * i.e by name or category
   * @returns
   */
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

      AppResponse.success(res, { products, totalProducts });
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
  /**
   *
   * it first deletes the products image from cloud storage
   * then deletes the product from model
   */
  async deleteProduct(req: Request, res: Response) {
    const { producId } = req.query;

    try {
      const product = await productModel.findById(producId).select(["image"]);
      if (!product) return AppResponse.notFound(res);

      //@ts-ignore
      await deleteFromCloud(product.image.url);
      await productModel.deleteOne({ _id: producId });
      AppResponse.success(res, "deleted successfully");
    } catch (e) {
      AppResponse.fail(res, e);
    }
  }

  // gets a single product from the productModel
  async getOneProduct(req: Request, res: Response) {
    const { productId } = req.query;

    try {
      const product = await productModel.findById(productId).lean();

      AppResponse.success(res, product);
    } catch (e) {
      AppResponse.fail(res, e);
    }
  }

  // method will add a product to user's cart
  async addToCart(req: Request, res: Response) {
    //@ts-ignore
    const { user } = req;
    const { productId } = req.params;

    try {
      const product = await productModel.findById(productId);

      if (!product) return AppResponse.notFound(res);

      const fetchUser = await Users.findById(user);

      await fetchUser?.addToCart(product);

      AppResponse.updated(res, "updated");
    } catch (e) {
      AppResponse.fail(res, e);
    }
  }

  /**
   *
   * method removes a single product from the cart
   * the product's id is passed to the @param req.param
   */
  async removeFromCart(req: Request, res: Response) {
    //@ts-ignore
    const { details } = req;
    const { productId } = req.params;

    try {
      await details.removeFromCart(productId);

      AppResponse.updated(res, "updated");
    } catch (e) {
      AppResponse.fail(res, e);
    }
  }

  // this method will get a users cart with the product populated
  async getCart(req: Request, res: Response) {
    //@ts-ignore
    const { user } = req;

    try {
      const userCart = await Users.findById(user).populate(
        "cart.items.productId",
        "Product"
      );

      if (!userCart) return AppResponse.notFound(res);

      //@ts-ignore
      AppResponse.success(res, { data: userCart.cart.items });
    } catch (e) {
      AppResponse.fail(res, e);
    }
  }

  /**
   * method creates a new order in the OrderModel collection
   * it populates data and makes all neccessary calculations
   */
  async makeOrder(req: Request, res: Response) {
    //@ts-ignore
    const { user } = req;

    try {
      const userM: IUser | null = await Users.findById(user)
        .select(["cart", "email", "_id"])
        .populate("cart.items.productId");

      if (!userM) AppResponse.notFound(res);

      // @ts-ignore
      const products = userM.cart.items.map((i) => {
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });

      // @ts-ignore
      const userDetails = { email: userM.email, userId: userM._id };
      await ProductServices.createOrder(userDetails, products);
      AppResponse.updated(res, "updated");
    } catch (e) {
      AppResponse.fail(res, e);
    }
  }

  /**
   *
   * @param req.body carries card data as well as the orderId
   * @param res will send an email but now return an object
   */
  async chargeCard(req: Request, res: Response) {
    //@ts-ignore
    const { details } = req;

    try {
      const token = await ProductServices.createUserToken(req.body);

      if (token) {
        return AppResponse.fail(res, "couldn't create card token");
      }

      const order = await ProductServices.chargeCard(req.body);
      //@ts-ignore
      const products = order.products.map((prod) => prod.name);
      const email = order.user.email;
      const orderObj = {
        //@ts-ignore
        status: order.payment.status,
        //@ts-ignore
        totalCost: order.payment.totalCost,
        //@ts-ignore
        date: order.payment.date,
        products,
      };

      await details.clearCart();
      // in the future an email will be sent here rather than return object to user
      AppResponse.success(res, orderObj);
    } catch (e) {
      AppResponse.fail(res, e);
    }
  }
}

export default new ProductCntrl();
