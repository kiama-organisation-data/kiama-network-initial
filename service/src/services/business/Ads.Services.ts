import { Request, Response } from "express";
import AdsModel, { IAds } from "../../model/business/Ads.Model";
import { deleteFromCloud } from "../../libs/cloudinary";

const saveAd = async (data: any) => {
	const ad: IAds = await AdsModel.create({
		...data,
	});
	return ad;
};

const getAnAd = async (adId: string) => {
	const ad = await AdsModel.findById(adId).lean();
	return ad;
};

const deleteAnAd = async (adId: string) => {
	const url = await AdsModel.findById(adId);
	//@ts-ignore
	await deleteFromCloud(url?.url);
	await AdsModel.findByIdAndDelete(adId);
	return true;
};

const getAds = async (no: number, target: string) => {
	const adNo = +no || 3;

	const targetArr = ["africa", "all"];

	if (!targetArr.includes(target)) return false;
	const ads = await AdsModel.find({ target }).limit(adNo).lean();

	if (!ads) return false;
	return ads;
};

export default {
	getAds,
	getAnAd,
	saveAd,
	deleteAnAd,
};
