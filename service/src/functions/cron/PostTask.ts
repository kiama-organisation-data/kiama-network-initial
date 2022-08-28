import { schedule } from "node-cron";
import moment from "moment";
import { postModel } from "../../model/Posts.Model";

schedule("0 0 0 0 0", async () => {
	const today = moment().format("YYYY-MM-DD hh:mm:ss");

	const posts = await postModel.find();

	if (posts) {
		posts.forEach(async (post: any) => {
			const expiresAt = moment(post.createdAt).format("YYYY-MM-DD hh:mm:ss");

			if (moment(today).isSameOrAfter(moment(expiresAt), "hours")) {
				//@ts-ignore
				postModel.deleteOne({ _id: post._id });
			}
		});
	}
});
