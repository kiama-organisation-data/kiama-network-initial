import { Request, Response } from "express";
import { uploadToCloud } from "../../libs/cloudinary";
import { IAds } from "../../model/business/Ads.Model";
import AppResponse from "../../services";
import adService from "../../services/business/Ads.Services";

/**
 * @function uploadAnAdd      /ads              -- post request
 * @function getAds           /ads              -- get request
 * @function getAnAd          /ads/adId         -- get request
 * @function deleteAnAd       /ads/adId         -- delete request
 * note: payment functionality for ads has not been implemented yet
 * cron job has not been implemented yet
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

			const data = {
				publicId: public_id,
				url: secure_url,
				fileType: file.mimetype,
				importance,
				duration,
				target,
				sponsorId,
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
}

export default new AdsController();
