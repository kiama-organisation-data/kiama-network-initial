import { Request, Response } from "express";
// import {  } from 'url';
import CentreModel from "../../model/collections/Centre.Model";
import shopModel from "../../model/collections/Shop.Model";
import Notifications from "../../model/Notifications.Model";
import AppResponse from "../../services";

// Every thing in this file and concerning this file is working perfectly

/**
 * @function getAllRequest /centre/collection-requests               -- get request
 * @function getOneRequest /centre/collection-request                -- get request
 * @function approveRequest /centre/collection-request               -- patch request
 * @function rejectRequest /centre/collection-request                -- delete request
 */

class CentreRoomCntrl {
  constructor() {}
  async getAllRequest(req: Request, res: Response) {
    const { category, latest, oldest, page } = req.query;
    const currentPage = page || 1;
    const perPage = 15;
    let totalRequests: number = 0;
    let searchBy: object = {};
    let sortBy: object = {};

    const count = await CentreModel.find().countDocuments();
    totalRequests = count;

    switch (latest) {
      case true:
        sortBy = { createdAt: -1 };
        break;

      default:
        break;
    }

    switch (oldest) {
      case true:
        sortBy = { createdAt: 1 };
        break;

      default:
        break;
    }

    switch (category) {
      case !undefined || !null:
        searchBy = { category };
        break;
      default:
        break;
    }
    try {
      const requests = await CentreModel.find(searchBy)
        .skip((currentPage - 1) * perPage)
        .limit(perPage)
        .sort(sortBy);

      if (!requests) return AppResponse.notFound(res);
      AppResponse.success(res, { requests, totalRequests });
    } catch (e) {
      AppResponse.fail(res, e);
    }
  }

  async getOneRequest(req: Request, res: Response) {
    const { requestId } = req.query;

    try {
      const request = await CentreModel.findById(requestId)
        .populate("user collectionId")
        .lean();

      //@ts-ignore
      delete request?.user.password;
      //@ts-ignore
      delete request?.user.friends;
      //@ts-ignore
      delete request?.user.friendRequest;
      //@ts-ignore
      delete request?.user.cart;
      //@ts-ignore
      delete request?.collectionId.credentials;
      if (!request) AppResponse.notFound(res);

      AppResponse.success(res, request);
    } catch (e) {
      AppResponse.fail(res, e);
    }
  }

  async approveRequest(req: Request, res: Response) {
    const { shopId, user, requestId } = req.query;

    try {
      await shopModel.findByIdAndUpdate(shopId, { approved: true });
      await CentreModel.findByIdAndDelete(requestId);
      // send a notification to let user know shop has been approved
      const content = "Your request for a shop has been approved";
      const link = `http://0.0.0.0/8181/kiama-network/api/v1/collections/shop/${shopId}`; //confirm this
      await Notifications.create({
        user,
        content,
        icon: "shop icon",
        type: "collections",
        link,
        notification: "Request accepted",
      });
      // send an email too
      AppResponse.updated(res, "updated");
    } catch (e) {
      AppResponse.fail(res, e);
    }
  }

  async rejectRequest(req: Request, res: Response) {
    const { shopId, reason, user, requestId } = req.body;

    try {
      await shopModel.findOneAndDelete(shopId);
      await CentreModel.findByIdAndDelete(requestId);
      // notify user that request was rejected with a reason why
      await Notifications.create({
        user,
        content: reason,
        icon: "shop icon",
        type: "collections",
        link: "", // link to learn more
        notification: "Request rejected",
      });
      // send an email
    } catch (e) {
      AppResponse.fail(res, e);
    }
  }
}

export default new CentreRoomCntrl();
