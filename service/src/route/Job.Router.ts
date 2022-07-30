import { Router } from "express";
import JobController from "../controller/Job.Controller";
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
    // portal
    this.router
      .route("/")
      .post(messageUploads, JobController.createJobPosting)
      .get(JobController.getAllJobPost);
    this.router
      .route("/:postId")
      .get(JobController.getJobPost)
      .delete(messageUploads, JobController.deleteJobPost);

    // portal
  }
}

export default new JobRoute().router;
