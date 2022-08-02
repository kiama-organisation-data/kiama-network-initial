import { Request, Response } from "express";
import { deleteFromCloud, uploadToCloud } from "../libs/cloudinary";
import sortData from "../middleware/utils";
import { IJobPortal, jobModel, jobPortalModel } from "../model/Job.Model";
import Users from "../model/UsersAuth.Model";
import AppResponse from "../services/index";

class JobCntrl {
  constructor() { }

  createJobPosting = async (req: Request, res: Response) => {
    //@ts-ignore
    const { body, user, file } = req;
    let doc: object = {};

    if (file) {
      const { secure_url, public_id } = await uploadToCloud(file.path);
      doc = { url: secure_url, publicId: public_id };
    }

    const job = await jobModel.create({
      ...body,
      poster: user,
      portal: req.query.portal,
      file: { ...doc, fileType: file?.mimetype },
    });

    try {
      AppResponse.created(res, job);
    } catch (error) {
      AppResponse.fail(res, error);
    }
  };

  deleteJobPost = async (req: Request, res: Response) => {
    const jobPost = await jobModel.findById(req.params.postId);

    if (!jobPost) {
      return AppResponse.notFound(res);
    }

    //@ts-ignore
    const publicId = jobPost.file.url;
    let result: any;

    if (publicId) {
      result = await deleteFromCloud(publicId);
    }

    await jobModel.findByIdAndDelete(req.params.postId);

    try {
      AppResponse.success(res, result);
    } catch (e) {
      AppResponse.fail(res, e);
    }
  };

  getJobPost = async (req: Request, res: Response) => {
    const job = await jobModel.findById(req.params.postId).lean();

    if (!job) {
      AppResponse.notFound(res);
    } else {
      AppResponse.success(res, job);
    }
  };

  getAllJobPost = (req: Request, res: Response) => {
    let query;
    jobModel
      .find(query || {})
      .then((jobPosting) => {
        const {
          search = "",
          perPage = 10,
          page = 1,
          sortBy = "createdAt",
          sortDesc = false,
          jobPortalId = "",
          select = "all",
        } = req.query;

        const querylowerd = search.toLowerCase();

        const filteredData = jobPosting.filter((item) => {
          return (
            // search
            item.poster.toString().includes(querylowerd) &&
            // Filter
            item.poster.toString() ===
            (jobPortalId.toString() || item.poster.toString())
          );
        });

        const sortedData = filteredData.sort(sortData.sortCompare(sortBy));
        if (sortDesc === "true") {
          sortedData.reverse();
        }

        const dataFinal = sortData.selectFields(sortedData, select);
        AppResponse.success(
          res,
          sortData.paginateArray(dataFinal, perPage, page),
          filteredData.length
        );
      })
      .catch((e) => {
        AppResponse.fail(res, e);
      });
  };

  createPortal = async (req: Request, res: Response) => {

    const { user } = req;

    try {
      // @ts-expect-error
      const upload = await uploadToCloud(req.file?.path);

      const portal: IJobPortal = await jobPortalModel.create({
        ...req.body,
        admins: [user],
        coverPhoto: {
          url: upload.secure_url,
          publicId: upload.public_id,
        },
      });

      await Users.findByIdAndUpdate(
        user,
        { $push: { jobPortals: portal._id } },
        { new: true }
      );

      AppResponse.created(res, portal);
    } catch (e) {
      AppResponse.fail(res, e);
    }
  };

  editPortal = async (req: Request, res: Response) => {

    const { body, user } = req;

    const portal = await jobPortalModel.findByIdAndUpdate(
      req.query.portal,
      body,
      { new: true }
    );

    if (!portal) {
      return AppResponse.notFound(res, "portal not found");
    }

    try {
      AppResponse.success(res, portal);
    } catch (e) {
      AppResponse.fail(res, e);
    }
  };

  updatePortalCoverPhoto = async (req: Request, res: Response) => {

    const { file, user } = req;
    let procceed = false;

    if (!file) {
      return AppResponse.fail(res, "provide an image for upload");
    }

    try {
      let portal = await jobPortalModel
        .findById(req.params.portalId)
        .select(["coverPhoto", "admins"]);

      portal?.admins.map((admin: any) => {
        // @ts-ignore
        if (user.toString() === admin.toString()) {
          procceed = true;
        }
      });

      if (!procceed) return AppResponse.notPermitted(res, "not an admin");

      // @ts-ignore
      await deleteFromCloud(portal?.coverPhoto.url);
      const upload = await uploadToCloud(file.path);

      if (!upload) {
        AppResponse.fail(res, "could not update cover photo");
      }

      await jobPortalModel.findByIdAndUpdate(
        req.params.portalId,
        { coverPhoto: { url: upload.secure_url, publicId: upload.public_id } },
        { new: true }
      );

      AppResponse.success(res, portal);
    } catch (e) {
      AppResponse.fail(res, e);
    }
  };

  deletePortal = async (req: Request, res: Response) => {
    const { portalId } = req.params;

    const { user } = req;
    let proceed = false;

    const portal = await jobPortalModel
      .findById(portalId)
      .select(["coverPhoto", "admins"])
      .lean();

    if (!portal) {
      return AppResponse.notFound(res);
    }

    portal?.admins.map((admin: any) => {
      // @ts-ignore
      if (user.toString() === admin.toString()) {
        proceed = true;
      }
    });

    try {
      if (!proceed) return AppResponse.notPermitted(res, "not an admin");
      // @ts-ignore
      await deleteFromCloud(portal.coverPhoto?.url);

      await jobPortalModel.findByIdAndDelete(portalId);
    } catch (e) {
      AppResponse.fail(res, e);
    }
  };

  addAdmin = async (req: Request, res: Response) => {
    const { portalId } = req.params;
    const { userId } = req.query;

    try {
      const portal = await jobPortalModel
        .findByIdAndUpdate(
          portalId,
          { $push: { admins: userId } },
          { new: true }
        )
        .select(["admins"]);

      if (portal) {
        await Users.findByIdAndUpdate(
          userId,
          { $push: { jobPortals: portal._id } },
          { new: true }
        );
      }
      AppResponse.success(res, portal);
    } catch (e) {
      AppResponse.fail(res, e);
    }
  };

  getAJobPortal = async (req: Request, res: Response) => {
    const { portalId } = req.params;

    try {
      const portal = await jobPortalModel.findById(portalId).lean();

      if (!portal) return AppResponse.notFound(res);

      AppResponse.success(res, portal);
    } catch (e) {
      AppResponse.fail(res, e);
    }
  };

  getAllJobPortals = (req: Request, res: Response) => {
    let query;
    jobPortalModel
      .find(query || {})
      .then((portal) => {
        const {
          search = "",
          perPage = 10,
          page = 1,
          sortBy = "createdAt",
          sortDesc = false,
          jobPortalId = "",
          select = "all",
        } = req.query;

        const querylowerd = search.toLowerCase();

        const filteredData = portal.filter((item) => {
          return (
            // search
            item._id.toString().includes(querylowerd) &&
            // Filter
            item._id.toString() ===
            (jobPortalId.toString() || item._id.toString())
          );
        });

        const sortedData = filteredData.sort(sortData.sortCompare(sortBy));
        if (sortDesc === "true") {
          sortedData.reverse();
        }

        const dataFinal = sortData.selectFields(sortedData, select);
        AppResponse.success(
          res,
          sortData.paginateArray(dataFinal, perPage, page),
          filteredData.length
        );
      })
      .catch((e) => {
        AppResponse.fail(res, e);
      });
  };
}

export default new JobCntrl();
