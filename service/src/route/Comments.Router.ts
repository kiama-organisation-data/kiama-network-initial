import { Router } from "express";
import commentsController from "../controller/Comments.Controller";
import validationToken from "../libs/verifyToken";

class CommentsRouter {
    router: Router;

    constructor() {
        this.router = Router();
        this.routes();
    }
    /**
     * @description: This method is used to define the routes of the CommentsRouter
     * @function routes "/:id" gets an id as a param used for fetching, deleting and editing
     */
    routes() {
        this.router
            .route("/")
            .post(commentsController.create)
            .get(commentsController.getAll);

        this.router
            .route("/:id")
            .delete(commentsController.deleteOne)
            .get(commentsController.getOne)
            .patch(commentsController.update);
    }
}

export default new CommentsRouter().router;
