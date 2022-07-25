import { Router } from "express";
import votesController from "../controller/Votes.Controller";
import validationToken from "../libs/verifyToken";

class VotesRouter {
    router: Router;

    constructor() {
        this.router = Router();
        this.routes();
    }
    /**
     * @description: This method is used to define the routes of the VotesRouter
     * @function routes "/:id" gets an id as a param used for fetching, deleting and editing
     */
    routes() {
        this.router
            .route("/")
            .post(votesController.create)
            .get(votesController.getAll);

        this.router
            .route("/:id")
            .delete(votesController.deleteOne)
            .get(votesController.getOne)
            .patch(votesController.update);
    }
}

export default new VotesRouter().router;
