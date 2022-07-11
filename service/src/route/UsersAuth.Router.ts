import { Router } from "express";
import userAuthController from "../controller/UsersAuth.Controller";
import userController from "../controller/User.Controller";

import validationToken from "../libs/verifyToken";

import multerMiddleware from "../middleware/fileUpload";

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
    this.router.get(
      "/me",
      validationToken.TokenValidation,
      userAuthController.profile
    ); //Route profile
    this.router.post("/refresh-token", userAuthController.refreshToken);
    this.router.post("/update-password/:id", userAuthController.UpdatePassword);

    // Route for user
    this.router.get("/:id", userController.GetUser);
    this.router.get(
      "/",
      validationToken.TokenValidation,
      userController.GetAllUsers
    );
    this.router.put("/:id", userController.UpdateUser);
    this.router.put("/:id/inactive", userController.InactiveUser);
    this.router.delete("/:id", userController.DeleteUser);
  }
}

export default new usersRouter().router;
