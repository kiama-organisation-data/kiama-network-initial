import { Request, Response } from "express";
import { uploadToCloud } from "../../libs/cloudinary";
import InfoModel, { IInfo } from "../../model/organizations/Info.Model";
import OrganizationModel from "../../model/organizations/Organization.Model";
import AppResponse from "../../services";

class InfoCntrl {
	constructor() {}

	async createInfo(req: Request, res: Response) {
		const { file, body, user: userId } = req;

		let image = {};
		if (file) {
			const arrayMimeTypes = [
				"image/jpeg",
				"image/jpg",
				"image/png",
				"video/mp4",
				"video/mpeg",
				"video/avi",
			];

			if (!arrayMimeTypes.includes(file.mimetype))
				return AppResponse.noFile(res);

			const { public_id, secure_url } = await uploadToCloud(file.path);

			image = { publicId: public_id, url: secure_url };
		}

		try {
			const fileType = file?.mimetype.split("/");
			const info: IInfo = await InfoModel.create({
				...body,
				...image,
				creator: userId,
				fileType: fileType ? fileType[0] : "none",
				isFile: file ? true : false,
				organization: [body.id],
			});

			await OrganizationModel.findByIdAndUpdate(body.id, {
				$push: { info: info._id },
			});
			AppResponse.created(res, info);
		} catch (e) {
			AppResponse.fail(res, e);
		}
	}

	async getInfo(req: Request, res: Response) {
		const { id } = req.query;

		try {
			const info = await InfoModel.findById(id)
				.populate("views.viewers", "name avatar")
				.lean();

			if (!info) return AppResponse.notFound(res);

			AppResponse.success(res, info);
		} catch (e) {
			AppResponse.fail(res, e);
		}
	}
}

export default new InfoCntrl();
