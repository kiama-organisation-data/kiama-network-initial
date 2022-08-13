import { Router } from "express";
import searchsController from "../controller/Search.Controller";
import validationToken from "../libs/verifyToken";

class SettingsRouter {
    router: Router;

    constructor() {
        this.router = Router();
        this.routes();
    }
    /**
     * @description: This method is used to define the routes of the SettingsRouter
     * @function routes "/:id" gets an id as a param used for fetching, deleting and editing
     */
    routes() {
        this.router.route("/user/:search").get(searchsController.searchPeople);
    }
}

export default new SettingsRouter().router;
