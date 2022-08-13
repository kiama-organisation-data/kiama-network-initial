import { Request, Response } from "express";
import { uploadToCloud } from "../libs/cloudinary";
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

  // add pagination later
  async getApplications(req: Request, res: Response) {
    const { jobPostId } = req.query;

    try {
      const application = await JobApplicationModel.find({
        jobPostId,
      })
        .populate("userId", "name email createdAt")
        .lean();

      if (!application) return AppResponse.notFound(res);

      AppResponse.success(res, application);
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
      const application = await JobApplicationModel.findOneAndDelete({
        userId,
        jobPostId,
      });

      if (!application) return AppResponse.notFound(res);

      AppResponse.success(res, "deleted");
    } catch (e) {
      AppResponse.fail(res, e);
    }
  }
}

export default new ApplicationCntrl();
