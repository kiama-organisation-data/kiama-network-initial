import { Router } from "express";
import userAuthController from "../../controller/users/UsersAuth.Controller";
import userController from "../../controller/users/User.Controller";

import validationToken from "../../libs/verifyToken";

import multerMiddleware from "../../middleware/fileUpload";
import UserUtilityController from "../../controller/users/UserUtility.Controller";

const roleAction = ['edit', 'andrana']
const roleSubject = ['aaaa', 'andrana']
const adminGuard = validationToken.authAdmin('editor', roleAction, roleSubject);

class usersRouter {
  router: Router;

  constructor() {
    this.router = Router();
    this.routes();
  }

  routes() {
    // Route auth user
    this.router.post("/", multerMiddleware, userAuthController.AddUser); //Create
    this.router.post("/login", userAuthController.Login); //Route login
    this.router.post("/logout", validationToken.TokenValidation, userAuthController.Logout); //Route logout
    this.router.get(
      "/me",
      validationToken.TokenValidation,
      userAuthController.profile
    ); //Route profile
    this.router.post("/refresh-token", userAuthController.refreshToken);
    this.router.post("/update-password/:id", userAuthController.UpdatePassword);

    // Route for user
    this.router.get(
      "/portal",
      validationToken.TokenValidation,
      UserUtilityController.getAllUserJobPortals
    );
    this.router.get(
      "/channel",
      validationToken.TokenValidation,
      UserUtilityController.getAllUserChannels
    );
    this.router.get(
      "/page",
      validationToken.TokenValidation,
      UserUtilityController.getAllUserPages
    );
    this.router.get(
      "/friend",
      validationToken.TokenValidation,
      UserUtilityController.getAllUserFriends
    );
    this.router.get(
      "/shops",
      validationToken.TokenValidation,
      UserUtilityController.getAllUsersVisitedShops
    );
    this.router.get("/:id", userController.GetUser);
    this.router.get(
      "/",
      validationToken.TokenValidation,
      validationToken.accessAdmin,
      adminGuard,
      userController.GetAllUsers
    );
    this.router.put("/:id", userController.UpdateUser);
    this.router.put("/:id/inactive", userController.InactiveUser);
    this.router.post("/blocked/:id", validationToken.TokenValidation, userController.blockUser);
    this.router.post("/unblocked/:id", validationToken.TokenValidation, userController.unblockUser);
    this.router.get("/blocked/user", validationToken.TokenValidation, userController.getBlockedUsers);
    this.router.delete("/:id", userController.DeleteUser);
  }
}

export default new usersRouter().router;
