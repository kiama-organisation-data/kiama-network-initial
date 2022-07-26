import { Router } from "express";
import settingsController from "../controller/Settings.Controller";
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
        this.router
            .route("/")
            .post(settingsController.create)
            .get(settingsController.getAll);

        this.router
            .route("/:id")
            .delete(settingsController.deleteOne)
            .get(settingsController.getOne)
            .patch(settingsController.update);
    }
}

export default new SettingsRouter().router;
