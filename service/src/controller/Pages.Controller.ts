import { Request, Response } from "express";
import pageModel from "../model/Pages.Model";
import PageServices from "../services/Page.Services";
import AppResponse from "../services/index";
import Users from "../model/UsersAuth.Model";

class PagesController {
  constructor() {}

  create = async (req: Request, res: Response) => {
    const isFile = PageServices.checkFile(req, res);
    if (isFile) {
      const { id } = req.body;
      const page = await pageModel.create({
        ...req.body,
        moderators: [id],
        image: {
          publicId: "dummy", // will be implemnted with cloudinary
          url: req.file?.path,
        },
      });
      let user = await Users.findById(id);
      //@ts-expect-error
      user?.pages = [page._id];
      //@ts-expect-error
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
      const page = await pageModel.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });
      try {
        AppResponse.success(res, page);
      } catch (e) {
        AppResponse.fail(res, e);
      }
    }
  };

  changePhoto = async (req: Request, res: Response) => {
    const isFile = PageServices.checkFile(req, res);
    if (isFile) {
      let page = await pageModel.findById(req.params.id);
      //@ts-expect-error
      page?.image.publicId = "dummy"; // to be implemented in cloudinary
      //@ts-expect-error
      page?.image.url = req.file?.path;
      //@ts-expect-error
      page = await page?.save();
      try {
        AppResponse.success(res, page);
      } catch (e) {
        AppResponse.fail(res, e);
      }
    }
  };

  deletePage = async (req: Request, res: Response) => {
    await pageModel.findByIdAndDelete(req.params.id);
    try {
      AppResponse.success(res, "deleted");
    } catch (e) {
      AppResponse.fail(res, e);
    }
  };

  addModerator = async (req: Request, res: Response) => {
    const isModerator = await PageServices.isModerator(req, res);
    console.log(isModerator);
    if (isModerator.success) {
      isModerator.page?.moderators.push(req.body.moderator);
      //@ts-expect-error
      isModerator.page = await isModerator.page.save();
      try {
        AppResponse.success(res, isModerator.page);
      } catch (e) {
        AppResponse.fail(res, e);
      }
    }
  };
}

export default new PagesController();
