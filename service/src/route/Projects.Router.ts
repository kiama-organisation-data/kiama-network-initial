import { Router } from "express";
import projectsController from "../controller/Projects.Controller";
import validationToken from "../libs/verifyToken";

class ProjectsRouter {
    router: Router;

    constructor() {
        this.router = Router();
        this.routes();
    }
    /**
     * @description: This method is used to define the routes of the ProjectsRouter
     * @function routes "/:id" gets an id as a param used for fetching, deleting and editing
     */
    routes() {
        this.router
            .route("/")
            .post(projectsController.create)
            .get(projectsController.getAll);

        this.router
            .route("/:id")
            .delete(projectsController.deleteOne)
            .get(projectsController.getOne)
            .patch(projectsController.update);
    }
}

export default new ProjectsRouter().router;
