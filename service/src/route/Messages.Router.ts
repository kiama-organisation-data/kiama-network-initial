import { Router } from "express";
import GroupMsgController from "../controller/GroupMsg.Controller";
import PrivateMsgController from "../controller/PrivateMsg.Controller";
import { messageUploads } from "../libs/multerConfig";
import messageHelpers from "../middleware/messageHelpers";

/**
 * remember to work on @function liveStreaming
 * remember to work on @function rooms
 * remember to add auth middleware on each route where neccessary
 */

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

    this.router
      .route("/:id")
      .delete(messageHelpers.isId, PrivateMsgController.deleteMessage);

    this.router.route("/reply/:id").post(PrivateMsgController.addReply);

    this.router
      .route("/mark-seen/:id")
      .put(messageHelpers.isId, PrivateMsgController.markSeen);

    this.router
      .route("/add-reaction/:id")
      .put(PrivateMsgController.addReactions);

    this.router
      .route("/set-forwarded/:id")
      .put(messageHelpers.isId, PrivateMsgController.setMsgAsFowarded);

    // groupMessaging routes
    this.router
      .route("/group/:id")
      .post(messageUploads, GroupMsgController.createGroup)
      .patch(GroupMsgController.editGroup)
      .put(
        messageHelpers.isId,
        messageUploads,
        GroupMsgController.editGroupPhoto
      )
      .delete(messageHelpers.isId, GroupMsgController.deleteGroupPhoto);

    this.router
      .route("/group/add/:id")
      .post(messageHelpers.isId, GroupMsgController.addMember);

    this.router
      .route("/group/remove/:id")
      .delete(messageHelpers.isId, GroupMsgController.removeMember);

    this.router
      .route("/group/delete/:id")
      .delete(messageHelpers.isId, GroupMsgController.deleteGroup);

    this.router
      .route("/group/exit/:id")
      .delete(messageHelpers.isId, GroupMsgController.editGroup); //this route in the future would be made to be same as remove member, when admin verification becomes a middleware

    this.router
      .route("/group/msg/:groupId")
      .post(messageUploads, GroupMsgController.sendMessage)
      .get(GroupMsgController.getMessages);

    this.router
      .route("/group/msg/:id")
      .delete(messageHelpers.isId, GroupMsgController.deleteMessage);

    this.router
      .route("/group/msg/mark-seen/:id")
      .patch(messageHelpers.isId, GroupMsgController.markSeen);

    this.router
      .route("/group/msg/add-reaction/:id")
      .patch(messageHelpers.isId, GroupMsgController.addReaction);

    this.router
      .route("/group/msg/forwarded/:id")
      .patch(messageHelpers.isId, GroupMsgController.setAsForwarded);

    this.router
      .route("/group/msg/reply/:id")
      .put(
        messageUploads,
        messageHelpers.isId,
        GroupMsgController.replyMessage
      );
  }
}

export default new MessagesRouter().router;
