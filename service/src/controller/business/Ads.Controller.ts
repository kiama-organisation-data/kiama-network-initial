import { Request, Response } from "express";
import { uploadToCloud } from "../../libs/cloudinary";
import { IAds } from "../../model/business/Ads.Model";
import AppResponse from "../../services";
import adService from "../../services/business/Ads.Services";
import ProductServices from "../../services/collections/Product.Services";

/**
 * @function uploadAnAdd      /ads              -- post request
 * @function getAds           /ads              -- get request
 * @function getAnAd          /ads/adId         -- get request
 * @function deleteAnAd       /ads/adId         -- delete request
 * @function payForAd         /ads/activate     -- post request
 *
 * When user creates an ad, it gets saved to the database but it's validity is set to false
 * and when getting ads it doesn't show cause it hasn't been payed for but when payment is successful, it * gets activated and validity set to true and user's ad get shown.
 * Only user's with a business or organization account can create ads(validation for account type on front end)
 */

class AdsController {
	constructor() {}

	async uploadAnAdd(req: Request, res: Response) {
		const file = req.file;
		if (!file) return AppResponse.noFile(res);

		const mimeType = [
			"video/mp4",
			"video/avi",
			"video/mpeg",
			"image/png",
			"image/jpeg",
			"image/jpg",
		];

		if (!mimeType.includes(file.mimetype))
			return AppResponse.fail(res, "unsupported file mimetype");

		const { user: sponsorId } = req;
		const { importance, duration, target } = req.body;

		try {
			const { public_id, secure_url } = await uploadToCloud(file.path);

			const paymentCost = await adService.adPriceSetter(
				target,
				importance,
				duration || "one-week"
			);
			const data = {
				publicId: public_id,
				url: secure_url,
				fileType: file.mimetype,
				importance,
				duration,
				target,
				sponsorId,
				paymentCost,
			};

			const response: IAds = await adService.saveAd(data);

			if (!response) return AppResponse.fail(res, "could not save ad");

			AppResponse.created(res, response);
		} catch (e) {
			AppResponse.fail(res, e);
		}
	}

	async deleteAnAd(req: Request, res: Response) {
		try {
			return AppResponse.success(
				res,
				await adService.deleteAnAd(req.params.adId)
			);
		} catch (e) {
			AppResponse.fail(res, e);
		}
	}

	async getAnAd(req: Request, res: Response) {
		try {
			const ad = await adService.getAnAd(req.params.adId);

			if (!ad) return AppResponse.fail(res, "ad has not ben payed for");

			return AppResponse.success(res, ad);
		} catch (e) {
			AppResponse.fail(res, e);
		}
	}

	async getAllAds(req: Request, res: Response) {
		const { no, target } = req.query;

		try {
			const ads = await adService.getAds(no, target);
			if (!ads) return AppResponse.notFound(res);

			AppResponse.success(res, ads);
		} catch (e) {
			AppResponse.fail(res, e);
		}
	}

	async payForAd(req: Request, res: Response) {
		const { body, user } = req;

		try {
			const token = await ProductServices.createUserToken(body);

			if (!token) return AppResponse.fail(res, "cannot create card token");

			const charge = await adService.adChargeCard({ adId: body.adId, token });

			if (!charge) return AppResponse.throwError(res);

			AppResponse.success(res, {
				success: charge.paymentStatus,
				validity: charge.valid,
			});
		} catch (e) {
			AppResponse.fail(res, e);
		}
	}
}

export default new AdsController();
