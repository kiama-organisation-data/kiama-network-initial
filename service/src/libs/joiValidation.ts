import Joi from "@hapi/joi";
import { IPrmsg } from "../model/Messages.Model";
import { IPost } from "../model/Posts.Model";
import { IUser } from "../model/UsersAuth.Model";

class JoiValidate {
  constructor() { }

  // signup verification
  signupValidation = (data: IUser) => {
    const usersShema = Joi.object({
      name: Joi.string().required(),
      username: Joi.string(),
      avatar: Joi.string(),
      email: Joi.string(),
      password: Joi.string().min(6).required(),
      role: Joi.string().required(),
      personalAbility: Joi.array(),
      status: Joi.string(),
      birthday: Joi.date(),
      gender: Joi.string(),
    });
    return usersShema.validate(data);
  };

  // login verification
  loginValidation = (data: IUser) => {
    const usersShema = Joi.object({
      email: Joi.string().required(),
      password: Joi.string().min(6).required(),
    });
    return usersShema.validate(data);
  };

  updatePasswordValidation = (data: IUser) => {
    const usersShema = Joi.object({
      _id: Joi.string().required(),
      name: Joi.string().required(),
      username: Joi.string(),
      email: Joi.string(),
      password: Joi.string().min(6).required(),
      role: Joi.string().required(),
      personalAbility: Joi.array(),
      status: Joi.string(),
      createdAt: Joi.date(),
      updatedAt: Joi.date(),
      __v: Joi.number(),
      newPassworda: Joi.string(),
      oldPassword: Joi.string().min(6).required(),
      newPassword: Joi.string().min(6).required(),
    });
    return usersShema.validate(data);
  };

  uploadFileValidation = (data: IPost) => {
    const postSchema = Joi.object({
      title: Joi.string().required().trim(),
      fileUrl: Joi.string(),
      fileType: Joi.string().required().trim(),
      files: Joi.array(),
    });
    return postSchema.validate(data);
  };

  sendPriMsgValidation = (data: IPrmsg) => {
    const postSchema = Joi.object({
      message: Joi.string(),
      from: Joi.array(),
      to: Joi.string(),
    });
    return postSchema.validate(data);
  };
}

const joiValidation = new JoiValidate();
export default joiValidation;
