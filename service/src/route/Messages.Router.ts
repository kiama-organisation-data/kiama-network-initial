import { Router } from "express";
import GroupMsgController from "../controller/GroupMsg.Controller";
import PrivateMsgController from "../controller/PrivateMsg.Controller";
import { messageUploads } from "../libs/multerConfig";

class MessagesRouter {
  router: Router;

  constructor() {
    this.router = Router();
    this.routes();
  }

  routes() {
    // privateMessaging routes
    this.router
      .route("/")
      .post(messageUploads, PrivateMsgController.sendMsg)
      .get(PrivateMsgController.getMessages);
    this.router.route("/:id").delete(PrivateMsgController.deleteMessage);
    this.router.route("/reply/:id").post(PrivateMsgController.addReply);
    this.router.route("/mark-seen/:id").put(PrivateMsgController.markSeen);
    this.router
      .route("/add-reaction/:id")
      .put(PrivateMsgController.addReactions);
    this.router
      .route("/set-forwarded/:id")
      .put(PrivateMsgController.setMsgAsFowarded);
    // groupMessaging routes
    this.router
      .route("/group/:id")
      .post(messageUploads, GroupMsgController.createGroup)
      .patch(GroupMsgController.editGroup)
      .put(messageUploads, GroupMsgController.editGroupPhoto)
      .delete(GroupMsgController.deleteGroupPhoto);
    this.router.route("/group/add/:id").post(GroupMsgController.addMember);
    this.router
      .route("/group/remove/:id")
      .delete(GroupMsgController.removeMember);
    this.router
      .route("/group/delete/:id")
      .delete(GroupMsgController.deleteGroup);
    this.router.route("/group/exit/:id").delete(GroupMsgController.editGroup); //this route in the future would be made to be same as remove member, when admin verification becomes a middleware
    this.router
      .route("/group/msg/:groupId")
      .post(messageUploads, GroupMsgController.sendMessage)
      .get(GroupMsgController.getMessages);
    this.router
      .route("/group/msg/:id")
      .delete(GroupMsgController.deleteMessage);
    this.router
      .route("/group/msg/mark-seen/:id")
      .patch(GroupMsgController.markSeen);
  }
}

export default new MessagesRouter().router;
