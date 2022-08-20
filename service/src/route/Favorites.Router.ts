import { Router } from "express";
import favoritesController from "../controller/Favorites.Controller";
import validationToken from "../middleware/verifyToken";

class FavoritesRouter {
    router: Router;

    constructor() {
        this.router = Router();
        this.routes();
    }
    /**
     * @description: This method is used to define the routes of the FavoritesRouter
     * @function routes "/:id" gets an id as a param used for fetching, deleting and editing
     */
    routes() {
        this.router
            .route("/")
            .post(favoritesController.create)
            .get(favoritesController.getAll);

        this.router
            .route("/:id")
            .delete(favoritesController.deleteOne)
            .get(favoritesController.getOne)
            .patch(favoritesController.update);
    }
}

export default new FavoritesRouter().router;
