import { schedule } from "node-cron";
import moment from "moment";
import AdsModel from "../../model/business/Ads.Model";

schedule("0 0 */28 * *", async () => {
	const today = moment().format("YYYY-MM-DD hh:mm:ss");

	const ads = await AdsModel.find({ valid: true });

	if (ads) {
		ads.forEach(async (ad: any) => {
			const expiresAt = moment(ad.expiresAt).format("YYYY-MM-DD hh:mm:ss");

			if (moment(today).isSameOrAfter(moment(expiresAt), "hours")) {
				//@ts-ignore
				AdsModel.deleteOne({ _id: ads._id });
			}
		});
	}
});
