import { Router } from "express";
import JobController from "../controller/Job.Controller";
import JobApplicationController from "../controller/JobApplication.Controller";
import { messageUploads } from "../libs/multerConfig";

class JobRoute {
	router: Router;
	constructor() {
		this.router = Router();
		this.routes();
	}

	routes() {
		this.router
			.route("/portal")
			.get(JobController.getAllJobPortals)
			.post(messageUploads, JobController.createPortal)
			.patch(JobController.editPortal);

		this.router
			.route("/portal/:portalId")
			.get(JobController.getAJobPortal)
			.patch(messageUploads, JobController.updatePortalCoverPhoto)
			.delete(JobController.deletePortal)
			.put(JobController.addAdmin);

		// application
		this.router
			.route("/apply")
			.get(JobApplicationController.getAnApplication)
			.post(messageUploads, JobApplicationController.submitApplication)
			.delete(JobApplicationController.deleteApplication);

		this.router
			.route("/applications")
			.get(JobApplicationController.getApplications);
		// portal
		this.router
			.route("/")
			.post(messageUploads, JobController.createJobPosting)
			.get(JobController.getAllJobPost);
		this.router
			.route("/:postId")
			.get(JobController.getJobPost)
			.delete(messageUploads, JobController.deleteJobPost);
	}
}

export default new JobRoute().router;
