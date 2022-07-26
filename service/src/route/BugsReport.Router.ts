import { Router } from "express";
import bugsController from "../controller/BugsReport.Controller";
import validationToken from "../libs/verifyToken";

class BugsRouter {
    router: Router;

    constructor() {
        this.router = Router();
        this.routes();
    }
    /**
     * @description: This method is used to define the routes of the BugsRouter
     * @function routes "/:id" gets an id as a param used for fetching, deleting and editing
     */
    routes() {
        this.router
            .route("/")
            .post(bugsController.create)
            .get(bugsController.getAll);

        this.router
            .route("/:id")
            .delete(bugsController.deleteOne)
            .get(bugsController.getOne)
            .patch(bugsController.update);
    }
}

export default new BugsRouter().router;
