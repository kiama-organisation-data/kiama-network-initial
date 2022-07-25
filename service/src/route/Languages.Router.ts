import { Router } from "express";
import languagesController from "../controller/Languages.Controller";
import validationToken from "../libs/verifyToken";

class LanguagesRouter {
    router: Router;

    constructor() {
        this.router = Router();
        this.routes();
    }
    /**
     * @description: This method is used to define the routes of the LanguagesRouter
     * @function routes "/:id" gets an id as a param used for fetching, deleting and editing
     */
    routes() {
        this.router
            .route("/")
            .post(languagesController.create)
            .get(languagesController.getAll);

        this.router
            .route("/:id")
            .delete(languagesController.deleteOne)
            .get(languagesController.getOne)
            .patch(languagesController.update);
    }
}

export default new LanguagesRouter().router;
