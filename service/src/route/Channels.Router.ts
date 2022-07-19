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

    this.router.route("/category").get(ChannelsController.getByCategory);

    this.router.route("/public-key").get(ChannelsController.getByPublicKey);

    this.router
      .route("/:channelId")
      .get(ChannelsController.getOne)
      .patch(ChannelsController.edit)
      .delete(ChannelsController.delete)
      .put(ChannelsController.addAdmin);

    this.router
      .route("/change-photo/:channelId")
      .patch(messageUploads, ChannelsController.uploadCoverPhoto);

    this.router
      .route("/followers/:channelId")
      .put(ChannelsController.addFollowers)
      .post(ChannelsController.requestToBeFollower)
      .delete(ChannelsController.unFollow);

    this.router
      .route("/post/:channelId")
      .post(messageUploads, ChannelsController.createPost)
      .put(ChannelsController.editPost)
      .get(ChannelsController.getAllPost);

    this.router
      .route("/utils/lock/:channelId")
      .put(ChannelsController.lockChannel);

    this.router
      .route("/utils/unlock/:channelId")
      .put(ChannelsController.deActivateChannel);

    this.router
      .route("/post/single/:postId")
      .get(ChannelsController.getPost)
      .delete(ChannelsController.deletePost);
  }
}

export default new ChannelRouter().router;
