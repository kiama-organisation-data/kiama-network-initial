import { schedule } from "node-cron";
import moment from "moment";
import { jobModel } from "../../model/Job.Model";

schedule("0 0 */1 * *", async () => {
	const today = moment().format("YYYY-MM-DD hh:mm:ss");

	const job = await jobModel.find();

	if (job) {
		job.forEach(async (jobPost: any) => {
			const expiresAt = moment(jobPost.expiresAt).format("YYYY-MM-DD hh:mm:ss");

			if (moment(today).isSameOrAfter(moment(expiresAt), "hours")) {
				//@ts-ignore
				jobModel.deleteOne({ _id: job._id });
			}
		});
	}
});
