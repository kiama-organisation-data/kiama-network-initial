import { Router } from "express";
import orientationsController from "../controller/Orientations.Controller";
import validationToken from "../libs/verifyToken";

class OrientationsRouter {
    router: Router;

    constructor() {
        this.router = Router();
        this.routes();
    }
    /**
     * @description: This method is used to define the routes of the OrientationsRouter
     * @function routes "/:id" gets an id as a param used for fetching, deleting and editing
     */
    routes() {
        this.router
            .route("/")
            .post(orientationsController.create)
            .get(orientationsController.getAll);

        this.router
            .route("/:id")
            .delete(orientationsController.deleteOne)
            .get(orientationsController.getOne)
            .patch(orientationsController.update);
    }
}

export default new OrientationsRouter().router;
