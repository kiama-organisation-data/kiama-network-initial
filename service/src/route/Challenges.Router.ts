import { Router } from "express";
import challengesController from "../controller/Challenges.Controller";
import validationToken from "../libs/verifyToken";

class ChallengesRouter {
    router: Router;

    constructor() {
        this.router = Router();
        this.routes();
    }
    /**
     * @description: This method is used to define the routes of the ChallengesRouter
     * @function routes "/:id" gets an id as a param used for fetching, deleting and editing
     */
    routes() {
        this.router
            .route("/")
            .post(challengesController.create)
            .get(challengesController.getAll);

        this.router
            .route("/:id")
            .delete(challengesController.deleteOne)
            .get(challengesController.getOne)
            .patch(challengesController.update);
    }
}

export default new ChallengesRouter().router;
