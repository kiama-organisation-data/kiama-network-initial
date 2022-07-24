import { Router } from "express";
import historysController from "../controller/Historys.Controller";
import validationToken from "../libs/verifyToken";

class HistorysRouter {
    router: Router;

    constructor() {
        this.router = Router();
        this.routes();
    }
    /**
     * @description: This method is used to define the routes of the HistorysRouter
     * @function routes "/:id" gets an id as a param used for fetching, deleting and editing
     */
    routes() {
        this.router
            .route("/")
            .post(historysController.create)
            .get(historysController.getAll);

        this.router
            .route("/:id")
            .delete(historysController.deleteOne)
            .get(historysController.getOne)
            .patch(historysController.update);
    }
}

export default new HistorysRouter().router;
