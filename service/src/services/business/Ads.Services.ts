import { Request, Response } from "express";
import AdsModel, { IAds } from "../../model/business/Ads.Model";
import { deleteFromCloud } from "../../libs/cloudinary";
import stripePayment from "../collections/Payment.Services";

const saveAd = async (data: any) => {
	const ad: IAds = await AdsModel.create({
		...data,
	});
	return ad;
};

const getAnAd = async (adId: string) => {
	const ad = await AdsModel.findById(adId).lean();
	if (!ad?.valid) return false;
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
	const ads = await AdsModel.find({ $and: [{ target }, { valid: true }] })
		.limit(adNo)
		.lean();

	if (!ads) return false;
	return ads;
};

const adPriceSetter = async (
	target: string,
	importance: string,
	duration: string
) => {
	const amountForAfrica = 3; // dollars
	const amountForAll = 5; // dollars
	const amountForNormal = 2; // dollars
	const amountForVery = 5; // dollars
	const amountForOneWeek = 2; // dollars
	const amountForTwoWeeks = 4; // dollars
	const amountForFourWeeks = 5; // dollars

	let tempAmount: number = 0;

	if (target === "all") {
		tempAmount = amountForAll;
		if (importance === "very") {
			tempAmount += amountForVery;
		} else {
			importance === "normal"
				? (tempAmount += amountForNormal)
				: (tempAmount = tempAmount);
		}
		if (duration === "one-week") {
			tempAmount += amountForOneWeek;
		} else if (duration === "two-weeks") {
			tempAmount += amountForTwoWeeks;
		} else {
			duration === "four-weeks"
				? (tempAmount += amountForFourWeeks)
				: (tempAmount += 0);
		}
	} else if (target === "africa") {
		tempAmount = amountForAfrica;
		if (importance === "very") {
			tempAmount += amountForVery;
		} else {
			importance === "normal"
				? (tempAmount += amountForNormal)
				: (tempAmount = tempAmount);
		}
		if (duration === "one-week") {
			tempAmount += amountForOneWeek;
		} else if (duration === "two-weeks") {
			tempAmount += amountForTwoWeeks;
		} else {
			duration === "four-weeks"
				? (tempAmount += amountForFourWeeks)
				: (tempAmount += 0);
		}
	}
	return tempAmount;
};

const adChargeCard = async (body: any) => {
	const { adId, token } = body;

	let ad = await AdsModel.findById(adId);
	//@ts-ignore
	const price = ad?.paymentCost * 100;

	const adObj = { description: "Payment of ads", price };

	const { id } = await stripePayment.chargeCard({
		description: adObj.description,
		price,
		tokenId: token,
		currency: "usd",
	});
	const { amount } = await stripePayment.validateCharge(id);

	//@ts-ignore
	ad?.valid = true;
	//@ts-ignore
	ad?.paymentStatus = "PAID";
	//@ts-ignore
	ad?.paymentCost = amount / 100;
	//@ts-ignore
	ad = await ad?.save();
	return ad;
};

export default {
	getAds,
	getAnAd,
	saveAd,
	deleteAnAd,
	adChargeCard,
	adPriceSetter,
};
