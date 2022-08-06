import { Router } from "express";
import validationToken from "../libs/verifyToken";
import passport from "passport";
import jwt from "jsonwebtoken";

import * as dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

class PassportsRouter {
    router: Router;

    constructor() {
        this.router = Router();
        this.routes();
    }
    /**
     * @description: This method is used to define the routes of the PassportsRouter
     * @function routes "/:id" gets an id as a param used for fetching, deleting and editing
     */
    routes() {

        this.router.get('/facebook', passport.authenticate('facebook', { scope: ['email', 'public_profile'] }));
        this.router.get('/facebook/callback',
            passport.authenticate('facebook', {
                session: false,
                failureRedirect: 'kiama-network/api/v1/user/login',
                successRedirect: '/'
            }), (req, res) => {
                // @ts-ignore
                res.header('Authorization', req.user.token).status(200).json({
                    success: true,
                    message: "Login success",
                    // @ts-ignore
                    userData: req.user.user,
                    // @ts-ignore
                    token: req.user.token,
                }).end();
            });

        this.router.get('/google', passport.authenticate('google', { scope: ['email', 'profile'] }));
        this.router.get('/google/callback',
            passport.authenticate('google', {
                session: false,
                failureRedirect: 'kiama-network/api/v1/user/login',
                successRedirect: '/'
            }), (req, res) => {
                // @ts-ignore
                res.header('Authorization', req.user.token).status(200).json({
                    success: true,
                    message: "Login success",
                    // @ts-ignore
                    userData: req.user.user,
                    // @ts-ignore
                    token: req.user.token,
                }).end();
            });
    }
}

export default new PassportsRouter().router;
