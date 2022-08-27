import { Request, Response } from "express";
import { deleteFromCloud, uploadToCloud } from "../libs/cloudinary";
import { jobModel } from "../model/Job.Model";
import JobApplicationModel from "../model/JobApplication.Model";
import AppResponse from "../services";

/**
 * @function submitApplication  /job/apply                          -- post request
 * @function getAnApplication   /job/apply                          -- get request
 * @function deleteApplication  /job/apply                          -- delete request
 * @function getApplications    /job/applications                   -- get request
 */

class ApplicationCntrl {
	constructor() {}

	async submitApplication(req: Request, res: Response) {
		const { user: userId } = req;
		const { jobPostId, text } = req.body;

		if (!req.file) return AppResponse.noFile(res);

		try {
			const { public_id, secure_url } = await uploadToCloud(req.file.path);

			const image = { publicId: public_id, url: secure_url };

			const application = await JobApplicationModel.create({
				userId,
				jobPostId,
				...image,
				text,
			});
			await jobModel.findByIdAndUpdate(jobPostId, {
				$push: { submissions: application._id },
			});
			AppResponse.success(res, "submitted");
		} catch (e) {
			AppResponse.fail(res, e);
		}
	}

	async getApplications(req: Request, res: Response) {
		const { jobPostId, page } = req.query;

		const perPage = 6;
		const currentPage = +page || 1;

		try {
			const count = await JobApplicationModel.find({
				jobPostId,
			}).countDocuments();

			const application = await JobApplicationModel.find({
				jobPostId,
			})
				.skip((currentPage - 1) * perPage)
				.limit(perPage)
				.populate("userId", "name email createdAt")
				.lean();

			if (!application) return AppResponse.notFound(res);

			AppResponse.success(res, { application, totalApps: count });
		} catch (e) {
			AppResponse.fail(res, e);
		}
	}

	async getAnApplication(req: Request, res: Response) {
		const { jobPostId, userId } = req.query;

		try {
			const application = await JobApplicationModel.findOne({
				jobPostId,
				userId,
			})
				.populate("userId", "name email createdAt")
				.lean();

			if (!application) return AppResponse.notFound(res);

			AppResponse.success(res, application);
		} catch (e) {
			AppResponse.fail(res, e);
		}
	}

	async deleteApplication(req: Request, res: Response) {
		const { user: userId } = req;
		const { jobPostId } = req.query;

		try {
			const application = await JobApplicationModel.findOne({
				userId,
			});

			if (!application) return AppResponse.notFound(res);

			await deleteFromCloud(application.url);

			await JobApplicationModel.deleteOne({ jobPostId });

			await jobModel.findByIdAndUpdate(jobPostId, {
				$pull: { submissions: application._id },
			});

			AppResponse.success(res, "deleted");
		} catch (e) {
			AppResponse.fail(res, e);
		}
	}
}

export default new ApplicationCntrl();
