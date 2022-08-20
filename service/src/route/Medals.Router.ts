import { Router } from "express";
import medalsController from "../controller/Medals.Controller";
import validationToken from "../middleware/verifyToken";

class MedalsRouter {
    router: Router;

    constructor() {
        this.router = Router();
        this.routes();
    }
    /**
     * @description: This method is used to define the routes of the MedalsRouter
     * @function routes "/:id" gets an id as a param used for fetching, deleting and editing
     */
    routes() {
        this.router
            .route("/")
            .post(medalsController.create)
            .get(medalsController.getAll);

        this.router
            .route("/:id")
            .delete(medalsController.deleteOne)
            .get(medalsController.getOne)
            .patch(medalsController.update);
    }
}

export default new MedalsRouter().router;
