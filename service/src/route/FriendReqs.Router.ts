import { Router } from "express";
import friendreqsController from "../controller/FriendReqs.Controller";
import validationToken from "../libs/verifyToken";

class FriendReqsRouter {
    router: Router;

    constructor() {
        this.router = Router();
        this.routes();
    }
    /**
     * @description: This method is used to define the routes of the FriendReqsRouter
     * @function routes "/:id" gets an id as a param used for fetching, deleting and editing
     */
    routes() {
        this.router
            .route("/")
            .post(friendreqsController.create)
            .get(friendreqsController.getAll);

        this.router
            .route("/:id")
            .delete(friendreqsController.deleteOne)
            .get(friendreqsController.getOne)
            .patch(friendreqsController.update);

        this.router.route("/send/:toUserID").post(friendreqsController.sendFriendReq);
        this.router.route("/accept/:fromUserID").post(friendreqsController.acceptFriendReq);
        this.router.route("/decline/:fromUserID").post(friendreqsController.declineFriendReq);
        this.router.route("/block/:fromUserID").post(friendreqsController.blockFriendReq);
        this.router.route("/unblock/:fromUserID").post(friendreqsController.unblockFriendReq);
        this.router.route("/receive/friendreq").get(friendreqsController.getAllFriendRec); // to check because she don't work with simple get
        this.router.route("/sent/friendreq").get(friendreqsController.getAllFriendSent); // to check because she don't work with simple get
        this.router.route("/friend/:userID").get(friendreqsController.getAllFriends);
        this.router.route("/cancel/:fromUserID").post(friendreqsController.cancelFriendReq);
        this.router.route("/new-friend/get").get(friendreqsController.getNewPeople);
    }
}

export default new FriendReqsRouter().router;
