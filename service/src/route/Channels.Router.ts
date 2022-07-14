import { Router } from "express";
import ChannelsController from "../controller/Channels.Controller";
import { messageUploads, postsUploads } from "../libs/multerConfig";

class ChannelRouter {
  router: Router;

  constructor() {
    this.router = Router();
    this.routes();
  }

  routes() {
    this.router
      .route("/")
      .post(ChannelsController.create)
      .get(ChannelsController.getAll);

    this.router
      .route("/:channelId")
      .get(ChannelsController.getOne)
      .patch(ChannelsController.edit)
      .delete(ChannelsController.delete)
      .put(ChannelsController.addAdmin);

    this.router
      .route("/change-photo/:channelId")
      .patch(messageUploads, ChannelsController.uploadCoverPhoto);
  }
}

export default new ChannelRouter().router;
