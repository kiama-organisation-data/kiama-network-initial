import { Router } from "express";
import eventsController from "../controller/Events.Controller";
import validationToken from "../libs/verifyToken";

class EventsRouter {
    router: Router;

    constructor() {
        this.router = Router();
        this.routes();
    }
    /**
     * @description: This method is used to define the routes of the EventsRouter
     * @function routes "/:id" gets an id as a param used for fetching, deleting and editing
     */
    routes() {
        this.router
            .route("/")
            .post(eventsController.create)
            .get(eventsController.getAll);

        this.router
            .route("/:id")
            .delete(eventsController.deleteOne)
            .get(eventsController.getOne)
            .patch(eventsController.update);
    }
}

export default new EventsRouter().router;
