import { Router } from "express";
import sessionsController from "../controller/Sessions.Controller";
import validationToken from "../libs/verifyToken";

class SessionsRouter {
    router: Router;

    constructor() {
        this.router = Router();
        this.routes();
    }
    /**
     * @description: This method is used to define the routes of the SessionsRouter
     * @function routes "/:id" gets an id as a param used for fetching, deleting and editing
     */
    routes() {
        this.router
            .route("/")
            .post(sessionsController.create)
            .get(sessionsController.getAll);

        this.router
            .route("/:id")
            .delete(sessionsController.deleteOne)
            .get(sessionsController.getOne)
            .patch(sessionsController.update);
    }
}

export default new SessionsRouter().router;
