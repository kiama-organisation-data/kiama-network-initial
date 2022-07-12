import { Request, Response } from "express";
import pageModel from "../model/Pages.Model";
import AppResponse from "./index";

class PageServices {
  constructor() {}

  checkFile = (req: Request, res: Response) => {
    if (req.file) {
      return true;
    } else {
      AppResponse.fail(res, "provide an image");
    }
  };

  isModerator = async (req: Request, res: Response) => {
    const page = await pageModel.findById(req.params.id);
    let success: Boolean = false;
    const { id } = req.body;
    page?.moderators.forEach((i) => {
      if (i === id) {
        success = true;
      }
      AppResponse.notPermitted(res, "not permitted");
    });
    return { success, page };
  };
}

export default new PageServices();
