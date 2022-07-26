import { Router } from "express";
import reportsController from "../controller/Reports.Controller";
import validationToken from "../libs/verifyToken";

class ReportsRouter {
    router: Router;

    constructor() {
        this.router = Router();
        this.routes();
    }
    /**
     * @description: This method is used to define the routes of the ReportsRouter
     * @function routes "/:id" gets an id as a param used for fetching, deleting and editing
     */
    routes() {
        this.router
            .route("/")
            .post(reportsController.create)
            .get(reportsController.getAll);

        this.router
            .route("/:id")
            .delete(reportsController.deleteOne)
            .get(reportsController.getOne)
            .patch(reportsController.update);
    }
}

export default new ReportsRouter().router;
