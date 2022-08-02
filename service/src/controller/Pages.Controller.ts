import { Request, Response } from "express";
import pageModel from "../model/Pages.Model";
import PageServices from "../services/Page.Services";
import AppResponse from "../services/index";
import Users from "../model/UsersAuth.Model";

/**
 * @function deletePage in the future remember to make it as to remove the page id
 * from all the users page in Users model
 */

class PagesController {
  constructor() { }

  create = async (req: Request, res: Response) => {
    const isFile = PageServices.checkFile(req, res);

    if (isFile) {
      const page = await pageModel.create({
        ...req.body,
        moderators: [req.params.id],
        creator: req.params.id,
        image: {
          publicId: "dummy", // will be implemnted with cloudinary
          url: req.file?.path,
        },
      });

      let user = await Users.findById(req.params.id);
      user?.pages.push(page._id);
      // @ts-ignore
      user = await user?.save();
      try {
        AppResponse.created(res, page);
      } catch (e) {
        AppResponse.fail(res, e);
      }
    }
  };

  edit = async (req: Request, res: Response) => {
    const isModerator = await PageServices.isModerator(req, res);
    if (isModerator.success) {
      const page = await pageModel.findByIdAndUpdate(
        req.body.pageId,
        req.body,
        {
          new: true,
        }
      );
      try {
        AppResponse.success(res, page);
      } catch (e) {
        AppResponse.fail(res, e);
      }
    } else {
      AppResponse.fail(res, "an error occured");
    }
  };

  changePhoto = async (req: Request, res: Response) => {
    const isFile = PageServices.checkFile(req, res);
    if (isFile) {
      let page = await pageModel.findById(req.params.id);
      // @ts-ignore
      page?.image.publicId = "dummy"; // to be implemented in cloudinary
      // @ts-ignore
      page?.image.url = req.file?.path;
      // @ts-ignore
      page = await page?.save();
      try {
        AppResponse.success(res, page);
      } catch (e) {
        AppResponse.fail(res, e);
      }
    }
  };

  deletePage = async (req: Request, res: Response) => {
    const isCreator = await PageServices.isCreator(req, res);
    if (isCreator.success) {
      await pageModel.findByIdAndDelete(req.body.pageId);
      try {
        AppResponse.success(res, "deleted");
      } catch (e) {
        AppResponse.fail(res, e);
      }
    } else {
      AppResponse.notPermitted(res, "");
    }
  };

  addModerator = async (req: Request, res: Response) => {
    const isModerator = await PageServices.isModerator(req, res);
    if (isModerator.success) {
      isModerator.page?.moderators.push(req.body.moderator);
      // @ts-ignore
      isModerator.page = await isModerator.page.save();
      let user = await Users.findOne({ _id: req.body.moderator });
      user?.pages.push(isModerator.page._id);
      // @ts-ignore
      user = await user.save();
      try {
        AppResponse.success(res, isModerator.page);
      } catch (e) {
        AppResponse.fail(res, e);
      }
    } else {
      AppResponse.fail(res, "an error occured");
    }
  };

  removeModerator = async (req: Request, res: Response) => {
    const isCreator = await PageServices.isCreator(req, res);

    if (isCreator.success) {
      const { moderatorId } = req.body;
      const result = await isCreator.page?.removeModerator(moderatorId);

      if (result) {
        AppResponse.success(res, isCreator.page);
      } else {
        AppResponse.fail(res, "couldn't  remove moderator");
      }
    } else {
      AppResponse.notPermitted(res, "");
    }
  };

  addVisitor = async (req: Request, res: Response) => {
    let page = await pageModel.findById(req.params.id);
    const user = await Users.findById(req.body.id);
    try {
      if (user && page) {
        const userId = user._id;
        const username = user.username;
        page?.visitors.push({ userId, username });
        page = await page.save();
        AppResponse.success(res, "updated");
      }
    } catch (error) {
      AppResponse.fail(res, error);
    }
  };

  getPage = async (req: Request, res: Response) => {
    const page = await pageModel.findById(req.params.id);
    try {
      if (page) {
        AppResponse.success(res, page);
      }
    } catch (e) {
      AppResponse.notFound(res, "not found");
    }
  };

  getPages = async (req: Request, res: Response) => {
    const pages = await pageModel.find().sort({ createdAt: 1 });
    try {
      if (pages) {
        AppResponse.success(res, pages);
      }
    } catch (e) {
      AppResponse.notFound(res, "not found");
    }
  };

  getAllVisitors = async (req: Request, res: Response) => {
    const visitors = await pageModel
      .findOne({ pageId: req.params.pageId })
      .select(["visitors"]);
    try {
      // @ts-ignore
      if (visitors?.visitors?.length > 1) {
        AppResponse.success(res, visitors);
      } else {
        AppResponse.notFound(res, "you have no vsitors yet");
      }
    } catch (e) {
      AppResponse.fail(res, "an error occured");
    }
  };
}

export default new PagesController();
