import { Request, Response } from 'express'
import Users, { IUser } from '../model/UsersAuth.Model'
import mongoose from 'mongoose'

import joiValidation from '../libs/joiValidation'

import jwt from 'jsonwebtoken'


class UserController {

    // initialisation constructor
    constructor() { }

    // =========================================================================
    // Add user
    // =========================================================================
    AddUser = async (req: Request, res: Response, body: any) => {
        // validation signup
        const { error } = joiValidation.signupValidation(req.body)
        if (error) return res.status(400).json(error.message)

        // validation email
        const emailExist = await Users.findOne({ email: req.body.email })
        if (emailExist) return res.status(400).json({ message: 'email already exists' })

        // saving new User
        try {
            const user: IUser = new Users({
                name: req.body.name,
                username: req.body.username,
                email: req.body.email,
                avatar: req.file?.path,
                password: req.body.password,
                role: req.body.role,
                ability: req.body.ability,
            })
            user.password = await user.encryptPassword(user.password)
            const savedUser = await user.save()
            res.json({ success: true, body: savedUser })
        } catch (e) {
            res.json({ success: false, message: e })
        }

    }

    // =========================================================================
    // Login user
    // =========================================================================
    Login = async (req: Request, res: Response) => {

        // Login validation
        const { error } = joiValidation.loginValidation(req.body)
        if (error) return res.status(400).json(error.message)

        // validation
        const user = await Users.findOne({ email: req.body.email, status: 'active' })

        if (!user) return res.status(400).json({
            success: false,
            message: "Email not found, please check your email and try again"
        })

        // validation password
        const correctPassword: Boolean = await user.validatePassword(req.body.password)
        if (!correctPassword) return res.status(400).json({
            success: false,
            message: "Password is incorrect"
        })

        // create a Token
        const token: string = jwt.sign({ _id: user._id }, process.env.SECRET_TOKEN || 'defaultToken', {
            expiresIn: 60 * 60 * 24
        })

        // create a refreshToken
        const refreshToken: string = jwt.sign({ _id: user._id }, process.env.SECRET_TOKEN || 'defaultRefreshToken', {
            expiresIn: 60 * 60 * 24 * 7
        })

        // get user data
        const userData = {
            _id: user._id,
            name: user.name,
            username: user.username,
            role: user.role,
            ability: user.ability,
            avatar: user.avatar,
        }

        res.header('Authorization', token).status(200).json({
            success: true,
            message: "Login success",
            userData, token, refreshToken
        })
    }

    // =========================================================================
    // Get profile user
    // =========================================================================
    profile = async (req: Request, res: Response) => {
        // verification user payload token with no password
        const user = await Users.findById(req.body, { password: 0, createdAt: 0, updatedAt: 0 });
        const token = req.header('Authorization');
        if (!user) {
            return res.status(404).json('No User found');
        }

        res.json({ token, user });
    }

    // =========================================================================
    // refresh token
    // =========================================================================
    refreshToken = async (req: Request, res: Response) => {
        const token = req.header('Authorization');
        if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

        let payload: any;
        try {
            const tokena = token.split(' ')[1];
            payload = jwt.verify(tokena, process.env.SECRET_TOKEN || 'defaultRefreshToken');
        } catch (e) {
            return res.status(401).json({ message: 'token is not valid' });
        }

        const userData = await Users.findById(payload._id);
        if (!userData) return res.status(404).json({ message: 'No userData found' });

        const tokenRefresh = jwt.sign({ _id: userData._id }, process.env.SECRET_TOKEN || 'defaultRefreshToken', {
            expiresIn: 60 * 60 * 24 * 7
        });

        res.json({
            token: tokenRefresh,
            refreshToken: tokenRefresh,
            userData: {
                _id: userData._id,
                name: userData.name,
                username: userData.username,
                role: userData.role,
                ability: userData.ability,
            }
        });
    }

    // Update password for user
    UpdatePassword = async (req: Request, res: Response) => {
        // validation update password
        const { error } = joiValidation.updatePasswordValidation(req.body)
        if (error) return res.status(400).json(error.message)

        const user = await Users.findById({ _id: req.params.id })
        if (!user) return res.status(400).json({ message: 'user not found' })



        // validation password
        const correctPassword: Boolean = await user.validatePassword(req.body.oldPassword)
        if (!correctPassword) return res.status(400).json({ message: 'Incorrect password' })

        user.password = await user.encryptPassword(req.body.newPassword)
        await user.save()
        res.json({ success: true, message: 'Password changed successfully' })
    }

}

const userController = new UserController()

export default userController