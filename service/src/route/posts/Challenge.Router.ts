import { Router } from "express";
import challengepostsController from "../../controller/posts/Challenge.Controller";
import validationToken from "../../libs/verifyToken";

class ChallengePostsRouter {
    router: Router;

    constructor() {
        this.router = Router();
        this.routes();
    }
    /**
     * @description: This method is used to define the routes of the ChallengePostsRouter
     * @function routes "/:id" gets an id as a param used for fetching, deleting and editing
     */
    routes() {
        this.router
            .route("/")
            .post(challengepostsController.create)
            .get(challengepostsController.getAll);

        this.router
            .route("/:id")
            .delete(challengepostsController.deleteOne)
            .get(challengepostsController.getOne)
            .patch(challengepostsController.update);
    }
}

export default new ChallengePostsRouter().router;
