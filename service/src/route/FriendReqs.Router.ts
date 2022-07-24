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
    }
}

export default new FriendReqsRouter().router;