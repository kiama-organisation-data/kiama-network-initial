import { Router } from "express";
import collaboratorsController from "../controller/Collaborators.Controller";
import validationToken from "../libs/verifyToken";

class CollaboratorsRouter {
    router: Router;

    constructor() {
        this.router = Router();
        this.routes();
    }
    /**
     * @description: This method is used to define the routes of the CollaboratorsRouter
     * @function routes "/:id" gets an id as a param used for fetching, deleting and editing
     */
    routes() {
        this.router
            .route("/")
            .post(collaboratorsController.create)
            .get(collaboratorsController.getAll);

        this.router
            .route("/:id")
            .delete(collaboratorsController.deleteOne)
            .get(collaboratorsController.getOne)
            .patch(collaboratorsController.update);
    }
}

export default new CollaboratorsRouter().router;
