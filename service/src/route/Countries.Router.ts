import { Router } from "express";
import countriesController from "../controller/Countries.Controller";
import validationToken from "../libs/verifyToken";

class CountriesRouter {
    router: Router;

    constructor() {
        this.router = Router();
        this.routes();
    }
    /**
     * @description: This method is used to define the routes of the CountriesRouter
     * @function routes "/:id" gets an id as a param used for fetching, deleting and editing
     */
    routes() {
        this.router
            .route("/")
            .post(countriesController.create)
            .get(countriesController.getAll);

        this.router
            .route("/:id")
            .delete(countriesController.deleteOne)
            .get(countriesController.getOne)
            .patch(countriesController.update);
    }
}

export default new CountriesRouter().router;
