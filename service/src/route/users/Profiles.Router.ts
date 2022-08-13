import { Router } from "express";
import profilesController from "../../controller/users/Profiles.Controller";
import validationToken from "../../libs/verifyToken";
import checkObjectId from '../../middleware/checkObjectId';

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

        this.router.route("/:id/follow").post(profilesController.followUser);
        this.router.route("/:id/followers").get(profilesController.getFollowers);
        this.router.route("/:id/following").get(profilesController.getFollowing);
        this.router.route("/user/:id").get(checkObjectId.isValidMiddleware('id'), profilesController.getProfileByUserId);
        // route for eductaion 
        this.router.route("/education").post(profilesController.addEducation);
        this.router
            .route("/education/:edu_id")
            .patch(profilesController.updateEducation)
            .delete(profilesController.deleteEducation)
            .get(profilesController.getEducation);
        // route for experience
        this.router.route("/experience").post(profilesController.addExperience);
        this.router
            .route("/experience/:exp_id")
            .delete(profilesController.deleteExperience)
            .patch(profilesController.updateExperience)
    }
}

export default new ProfilesRouter().router;
