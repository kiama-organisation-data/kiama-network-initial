import { Router } from "express";
import newsController from "../../controller/category/News.Controller";
import validationToken from "../../middleware/verifyToken";

class NewsRouter {
    router: Router;

    constructor() {
        this.router = Router();
        this.routes();
    }
    /**
     * @description: This method is used to define the routes of the NewsRouter
     * @function routes "/:id" gets an id as a param used for fetching, deleting and editing
     */
    routes() {
        this.router
            .route("/")
            .post(newsController.create)
            .get(newsController.getAll);

        this.router
            .route("/:id")
            .delete(newsController.deleteOne)
            .get(newsController.getOne)
            .patch(newsController.update);
    }
}

export default new NewsRouter().router;
