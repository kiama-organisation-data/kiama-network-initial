import { Router } from "express";
import notificationsController from "../controller/Notifications.Controller";
import validationToken from "../middleware/verifyToken";

class NotificationsRouter {
    router: Router;

    constructor() {
        this.router = Router();
        this.routes();
    }
    /**
     * @description: This method is used to define the routes of the NotificationsRouter
     * @function routes "/:id" gets an id as a param used for fetching, deleting and editing
     */
    routes() {
        this.router
            .route("/")
            .post(notificationsController.create)
            .get(notificationsController.getAll);

        this.router
            .route("/:id")
            .delete(notificationsController.deleteOne)
            .get(notificationsController.getOne)
            .patch(notificationsController.update);
    }
}

export default new NotificationsRouter().router;
