import { Request, Response } from "express";
import { IPagepost, pagePostModel } from "../model/Posts.Model";
import PageServices from "../services/Page.Services";
import AppResponse from "../services/index";

/**
 * @function deletePost in the future would use cloudinary
 * remeber to add comments for page post
 */

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
    } else {
      AppResponse.fail(res, "could not publish post");
    }
    try {
      AppResponse.created(res, post);
    } catch (e) {
      AppResponse.fail(res, e);
    }
  };

  edit = async (req: Request, res: Response) => {
    let post = await pagePostModel.findById(req.params.id);

    if (req.query.file === "video") {
      //@ts-expect-error
      post?.content.video.coverText = req.body.coverText;
    } else if (req.query.file === "image") {
      //@ts-expect-error
      post?.content.image.coverText = req.body.coverText;
    } else if (req.query.file === "text") {
      //@ts-expect-error
      post?.content.text = req.body.text;
    }
    //@ts-expect-error
    post = await post?.save();
    try {
      AppResponse.success(res, post);
    } catch (e) {
      AppResponse.fail(res, e);
    }
  };

  deletePost = async (req: Request, res: Response) => {
    // remeber to implement cloudinary delete
    const post = await pagePostModel.findByIdAndDelete(req.params.id);
    try {
      AppResponse.success(res, "deleted");
    } catch (e) {
      AppResponse.fail(res, e);
    }
  };

  getAll = async (req: Request, res: Response) => {
    const currentPage: any = req.query.page || 1;
    const perpage = 8;
    let totalItems: number;
    const postsTotal = await pagePostModel
      .find({ pageId: req.params.pageId })
      .countDocuments();
    totalItems = postsTotal;
    try {
      const posts = await pagePostModel
        .find({ pageId: req.params.pageId })
        .skip((currentPage - 1) * perpage)
        .sort({ updatedAt: -1 })
        .limit(perpage);
      if (posts) {
        AppResponse.success(res, { posts: posts, totalItems: totalItems });
      } else {
        AppResponse.notFound(res, "not found");
      }
    } catch (e) {
      AppResponse.fail(res, e);
    }
  };

  getOne = async (req: Request, res: Response) => {
    const post = await pagePostModel.findById(req.params.id);
    try {
      if (post) {
        AppResponse.success(res, post);
      } else {
        AppResponse.notFound(res, "not found");
      }
    } catch (e) {
      AppResponse.fail(res, e);
    }
  };
}

export default new PostPgtrl();
