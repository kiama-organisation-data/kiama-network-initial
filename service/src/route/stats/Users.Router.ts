import { Router } from "express";
import UsersStatController from "../../controller/stats/Users.Controller";
import validationToken from "../../middleware/verifyToken";

class UsersStatRouter {
    router: Router;

    constructor() {
        this.router = Router();
        this.routes();
    }
    /**
     * @description: This method is used to define the routes of the UsersStatRouter
     * @function routes "/:id" gets an id as a param used for fetching, deleting and editing
     */
    routes() {
        this.router.get("/new-per-day", validationToken.TokenValidation, UsersStatController.countNewUserPerDay);
        this.router.get("/charts", validationToken.TokenValidation, UsersStatController.getStatChartUser);
    }
}

export default new UsersStatRouter().router;
