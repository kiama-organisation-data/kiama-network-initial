import shopServices from "../../services/collections/Shop.Services";
import AppResponse from "../../services/index";
import { Request, Response } from "express";
import { uploadToCloud } from "../../libs/cloudinary";
import joiValidation from "../../libs/joiValidation";
import shopModel from "../../model/collections/Shop.Model";
import redisConfig from "../../libs/redis";
import Users from "../../model/users/UsersAuth.Model";
import CentreModel from "../../model/collections/Centre.Model";

// important comments to pay attention to

/**
 * User requests for a shop
 * This request is submitted to the technical team which then views user profile
 * If user seems to meet the reqirements for one, he's request is acceped
 * On acceptance, he or she can go on and create a shop
 * @function createShop handles the creation of shop
 * It creates a new shop as well as pass the id of the shop to the users model
 * And sets the users accountType to business
 * This setting helps for integrations later
 */

// routes for this controller

/**
 *
 * Note: all routes are appended to http://localhost:port/kiama-network/api/v1/collections/
 * @function createShop /shop                                      -- post request
 * @function getSingleShop /shop/one                               -- get request
 * @function updateShopDetails /shop/one                           -- patch request
 * @function addCustomer /shop/add-customer                        -- patch request
 * @function getShopsProducts /shop/products                       -- get request
 * @function getShopCustomers /shop/customers                      -- get request
 * @function getShopToken /shop/generate-token                     -- get request
 * @function getUsersShop /shop/get-all/users-shops                -- get request
 * @function loginToShop /shop/login                               -- post request
 *
 * totalRequest: 9
 */

class ShopCntl {
	constructor() {}
	/**
	 * @function createShop is going to be available only to the workers at the centre room
	 * an email would be sent with user shops credentials
	 */
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

			const shop = await shopServices.createNew({
				brand,
				body,
				owner: user,
			});
			await CentreModel.create({
				user,
				collectionId: shop._id,
				category: "shop",
				purpose: body.purpose,
			});
			//     await Users.findOneAndUpdate(
			//       { _id: user },
			//       {
			//         $push: { "collections.shop": shop._id, accountType: "business" },
			//       }
			//     );
			let shopOwner = await Users.findById(user);
			shopOwner?.collections.shop.push(shop._id);
			//@ts-ignore
			shopOwner?.accountType = "business";
			shopOwner?.save();
			AppResponse.created(res, shop);
		} catch (e) {
			AppResponse.fail(res, e);
		}
	}

	// method will get a single shop returning the owners details populated too
	async getSingleShop(req: Request, res: Response) {
		const { shopId } = req.query;

		if (!shopId) return AppResponse.fail(res, "please provide shopId");

		try {
			const shop = await shopModel
				.findById(shopId)
				.populate("owner", "name avatar gender")
				.lean();

			if (!shop) return AppResponse.notFound(res);

			if (!shop.approved)
				return AppResponse.notPermitted(
					res,
					"this site hasn\t been approved yet"
				);

			AppResponse.success(res, shop);
		} catch (e) {
			AppResponse.fail(res, e);
		}
	}

	/**
	 * method will get all the products in a shop
	 * not to be confused with the get products method in the productController
	 * tho they do same thing but these method returns the products when user visits the shop
	 * but that of the shopController will be used to advertise products of shops
	 * @returns populated products
	 */
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

	// get all users who are customers
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

	// update for allowed fields of update in a shop
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

	/**
	 *
	 * this adds a user to a customer for a shop
	 * in the future, customers will receive notifications when new products arrive in shops
	 */
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

	/**
	 *
	 * When owner of shop logins in to shop
	 * he or she needs this token in other to make delicate actions on the shop
	 * the shop's id and shop's secretKey is used to create a token
	 * this token get's stored in redis temporarily for 24hrs
	 */
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
	/**
	 * In order to login to the shop
	 * the shop frontOffice only needs to submit the shopId
	 * since this is a unique key and has been saved as a key in redis for the token,
	 * @constant loginKey checks redis for a value with key of the shopId
	 * if found then user is loggedIn
	 * else, the secretKey for the shop is checked for with the shopId as a query
	 * if secretKey is equivalent to that provided
	 * then a new token is created and saved and user get logged in
	 * @returns the token
	 */
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

	// gets a users shop
	async getUsersShop(req: Request, res: Response) {
		const { user } = req;
		try {
			const shops = await shopModel
				.find({ owner: user })
				.lean()
				.sort({ createdAt: -1 });

			if (!shops) return AppResponse.notFound(res, "no shops for user");

			shops.map((shop) => {
				if (!shop.approved)
					return AppResponse.notPermitted(
						res,
						"this site hasn't been approved yet"
					);
			});
			AppResponse.success(res, shops);
		} catch (e) {
			AppResponse.fail(res, e);
		}
	}
}

const shopController = new ShopCntl();

export default shopController;
