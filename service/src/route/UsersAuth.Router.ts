import { Router } from 'express';
import userAuthController from '../controller/UsersAuth.Controller';
import userController from '../controller/User.Controller';
import validationToken from '../libs/verifyToken'

import multerMiddleware from '../middleware/fileUpload'

class usersRouter {

    router: Router;

    constructor() {
        this.router = Router();
        this.routes();
    }

    routes() {
        // DESCRIPTION: Route auth user
        this.router.post('/add', multerMiddleware, userAuthController.AddUser) //Create
        this.router.post('/login', userAuthController.Login) //Route login
        this.router.get('/profile', validationToken.TokenValidation, userAuthController.profile) //Route profile
        this.router.post('/refresh-token', userAuthController.refreshToken)
        this.router.post('/update-password/:id', userAuthController.UpdatePassword)
        // DESCRIPTION: Route for user
        this.router.get('/list/:id', userController.GetUser)
        this.router.get('/list', userController.GetAllUsers)
        this.router.post('/update/:id', userController.UpdateUser)
        this.router.get('/delete/:id', userController.InactiveUser)

    }
}

export default new usersRouter().router;