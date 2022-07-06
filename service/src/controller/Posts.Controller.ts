import { Request, Response } from "express";
import joiValidation from "../libs/joiValidation";
import postModel from "../model/Posts.Model";

class PostsController {
  constructor() {}

  UploadFile(req: Request, res: Response) {
    const file = req.file || req.files;
    let data: any;
    if (!file)
      return res
        .status(400)
        .json({ msg: "please choose a file", success: "fail" });
    if (!req.body) {
      data = { file };
    }
    const body = req.body;
    data = { ...body, file };
    // const { error } = joiValidation.uploadFileValidation(data);
    // if (error) return error;
    console.log(data);
    // let post = new postModel({...data});
  }
}

const uploadController = new PostsController();

export default uploadController;
