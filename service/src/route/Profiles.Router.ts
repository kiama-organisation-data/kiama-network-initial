import { Router } from "express";
import profilesController from "../controller/Profiles.Controller";
import validationToken from "../libs/verifyToken";

class ProfilesRouter {
    router: Router;

    constructor() {
        this.router = Router();
        this.routes();
    }
    /**
     * @description: This method is used to define the routes of the ProfilesRouter
     * @function routes "/:id" gets an id as a param used for fetching, deleting and editing
     */
    routes() {
        this.router
            .route("/")
            .post(profilesController.create)
            .get(profilesController.getAll);

        this.router
            .route("/:id")
            .delete(profilesController.deleteOne)
            .get(profilesController.getOne)
            .patch(profilesController.update);
    }
}

export default new ProfilesRouter().router;
