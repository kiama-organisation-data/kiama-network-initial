import { Request, Response } from "express";
import pageModel from "../../model/Pages.Model";
import { pagePostModel } from "../../model/Posts.Model";
import AppResponse from "../index";

class PageServices {
  constructor() {}

  checkFile = (req: Request, res: Response) => {
    if (req.file) {
      return true;
    } else {
      throw new Error("Please provide image");
    }
  };

  isModerator = async (req: Request, res: Response) => {
    const page = await pageModel.findById(req.body.pageId);
    let success: Boolean = false;
    const { id } = req.params;
    page?.moderators.forEach((i) => {
      if (i === id) {
        success = true;
      }
    });
    return { success, page };
  };

  isCreator = async (req: Request, res: Response) => {
    const page = await pageModel.findOne({ creator: req.params.id });
    let success: Boolean = false;
    if (page) {
      success = true;
    }
    return { page, success };
  };

  addLikes = async (req: Request, res: Response) => {
    const page = await pageModel.findById(req.params.id);
    const addlike = await page?.addLikes(req.body.id); // req.user
    if (addlike) {
      AppResponse.success(res, "like added");
    } else {
      AppResponse.fail(res, "couldn't add like");
    }
  };

  removeLikes = async (req: Request, res: Response) => {
    const page = await pageModel.findById(req.params.id);
    const removeLike = await page?.removeLikes(req.body.id); // req.user
    if (removeLike) {
      AppResponse.success(res, "like removed");
    } else {
      AppResponse.fail(res, "couldn't remove like");
    }
  };

  saveImages = async (req: Request, res: Response) => {
    const url: Array<any> = [];
    let coverText: String | null = null;
    // @ts-ignore
    req.files.map((i: any) => {
      url.push(i.path);
    });

    if (req.body.coverText) {
      coverText = req.body.coverText;
    }

    const post = await pagePostModel.create({
      content: {
        image: {
          coverText,
          url,
        },
      },
      pageId: req.body.pageId,
      tags: req.body.tags,
    });
    return post;
  };

  saveVideos = async (req: Request, res: Response) => {
    const url: Array<any> = [];
    let coverText: String | null = null;
    // @ts-ignore
    req.files.map((i: any) => {
      url.push(i.path);
    });
    if (req.body.coverText) {
      coverText = req.body.coverText;
    }

    const post = await pagePostModel.create({
      content: {
        video: {
          coverText,
          url: url[0],
        },
      },
      pageId: req.body.pageId,
      tags: req.body.tags,
    });
    return post;
  };

  saveText = async (req: Request, res: Response) => {
    const post = await pagePostModel.create({
      content: {
        text: req.body.text,
      },
      pageId: req.body.pageId,
      tags: req.body.tags,
    });
    return post;
  };
}

export default new PageServices();
