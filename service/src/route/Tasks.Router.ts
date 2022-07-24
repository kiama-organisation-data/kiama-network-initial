import { Router } from "express";
import tasksController from "../controller/Tasks.Controller";
import validationToken from "../libs/verifyToken";

class TasksRouter {
    router: Router;

    constructor() {
        this.router = Router();
        this.routes();
    }
    /**
     * @description: This method is used to define the routes of the TasksRouter
     * @function routes "/:id" gets an id as a param used for fetching, deleting and editing
     */
    routes() {
        this.router
            .route("/")
            .post(tasksController.create)
            .get(tasksController.getAll);

        this.router
            .route("/:id")
            .delete(tasksController.deleteOne)
            .get(tasksController.getOne)
            .patch(tasksController.update);
    }
}

export default new TasksRouter().router;
