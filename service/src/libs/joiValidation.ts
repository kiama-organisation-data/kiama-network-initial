import Joi from '@hapi/joi'
import { IUser } from '../model/UsersAuth.Model';

class JoiValidate {
    constructor() { }

    // signup verification
    signupValidation = (data: IUser) => {
        const usersShema = Joi.object({
            name: Joi
                .string()
                .required(),
            username: Joi
                .string(),
            avatar: Joi
                .string(),
            email: Joi
                .string(),
            password: Joi
                .string()
                .min(6)
                .required(),
            role: Joi
                .string()
                .required(),
            personalAbility: Joi
                .array(),
            status: Joi
                .string(),
        })
        return usersShema.validate(data)
    }

    // login verification
    loginValidation = (data: IUser) => {
        const usersShema = Joi.object({
            email: Joi
                .string()
                .required(),
            password: Joi
                .string()
                .min(6)
                .required()
        })
        return usersShema.validate(data)
    }

    updatePasswordValidation = (data: IUser) => {
        const usersShema = Joi.object({
            _id: Joi
                .string()
                .required(),
            name: Joi
                .string()
                .required(),
            username: Joi
                .string(),
            email: Joi
                .string(),
            password: Joi
                .string()
                .min(6)
                .required(),
            role: Joi
                .string()
                .required(),
            personalAbility: Joi
                .array(),
            status: Joi
                .string(),
            createdAt: Joi
                .date(),
            updatedAt: Joi
                .date(),
            __v: Joi
                .number(),
            newPassworda: Joi
                .string(),
            oldPassword: Joi
                .string()
                .min(6)
                .required(),
            newPassword: Joi
                .string()
                .min(6)
                .required()
        })
        return usersShema.validate(data)
    }

}

const joiValidation = new JoiValidate()
export default joiValidation