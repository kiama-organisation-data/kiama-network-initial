import { Request, Response } from "express";
import { IPagepost } from "../model/Posts.Model";
import PageServices from "../services/Page.Services";
import AppResponse from "../services/index";

class PostPgtrl {
  constructor() {}

  create = async (req: Request, res: Response) => {
    let post: IPagepost | null = null;
    if (req.query.file === "video") {
      post = await PageServices.saveVideos(req, res);
    } else if (req.query.file === "text") {
      post = await PageServices.saveText(req, res);
    } else if (req.query.file === "image") {
      post = await PageServices.saveImages(req, res);
    }
    console.log(post);
    try {
      AppResponse.created(res, post);
    } catch (e) {
      AppResponse.fail(res, e);
    }
  };

  edit = async (req: Request, res: Response) => {};
  deletePost = async (req: Request, res: Response) => {};
  getAll = async (req: Request, res: Response) => {};
  getOne = async (req: Request, res: Response) => {};
}

export default new PostPgtrl();
