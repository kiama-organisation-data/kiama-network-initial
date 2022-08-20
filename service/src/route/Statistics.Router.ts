import { Router } from "express";
import statisticsController from "../controller/Statistics.Controller";
import validationToken from "../middleware/verifyToken";

class StatisticsRouter {
    router: Router;

    constructor() {
        this.router = Router();
        this.routes();
    }
    /**
     * @description: This method is used to define the routes of the StatisticsRouter
     * @function routes "/:id" gets an id as a param used for fetching, deleting and editing
     */
    routes() {
        this.router
            .route("/")
            .post(statisticsController.create)
            .get(statisticsController.getAll);

        this.router
            .route("/:id")
            .delete(statisticsController.deleteOne)
            .get(statisticsController.getOne)
            .patch(statisticsController.update);
    }
}

export default new StatisticsRouter().router;
