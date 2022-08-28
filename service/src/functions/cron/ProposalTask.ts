import { schedule } from "node-cron";
import moment from "moment";
import ProposalsModel from "../../model/business/Proposals.Model";

schedule("0 0 */14 * *", async () => {
	const today = moment().format("YYYY-MM-DD hh:mm:ss");

	const proposal = await ProposalsModel.find();

	if (proposal) {
		proposal.forEach(async (proposal: any) => {
			const expiresAt = moment(proposal.expiresAt).format(
				"YYYY-MM-DD hh:mm:ss"
			);

			if (moment(today).isSameOrAfter(moment(expiresAt), "hours")) {
				//@ts-ignore
				ProposalsModel.deleteOne({ _id: proposal._id });
			}
		});
	}
});
