import { Request, Response } from "express";
import { deleteFromCloud } from "../../libs/cloudinary";
import OrganizationModel from "../../model/organizations/Organization.Model";
import AppResponse from "../../services";
import OrganizationServices from "../../services/organization/Organization.Services";

interface IData {
	id: string;
	members: Array<any>;
}

class OrganizationCntrl {
	constructor() {}

	async createOrganization(req: Request, res: Response) {
		const { body, user } = req;

		try {
			// @ts-ignore
			await OrganizationServices.saveOrganization(body, user);

			AppResponse.created(res, "successful");
		} catch (e) {
			AppResponse.fail(res, e);
		}
	}

	async getOrganization(req: Request, res: Response) {
		const { organizationId, id } = req.query;
		let fetchParam = {};

		if (organizationId && id) {
			fetchParam = { $and: [{ uniqueId: organizationId }, { _id: id }] };
		} else if (organizationId) {
			fetchParam = { uniqueId: organizationId };
		} else if (id) {
			fetchParam = { _id: id };
		}

		try {
			const organization = await OrganizationModel.findOne(fetchParam).populate(
				"members",
				"name avatar"
			);

			if (!organization) return AppResponse.notFound(res);

			if (!organization.public) {
				//@ts-ignore
				delete organization.members;
				//@ts-ignore
				delete organization.executives;
				//@ts-ignore
				delete organization.info;
			}

			AppResponse.success(res, organization);
		} catch (e) {
			AppResponse.fail(res, e);
		}
	}

	async editOrganization(req: Request, res: Response) {
		const body = req.body;
		try {
			await OrganizationModel.findOneAndUpdate(
				{ _id: body.id },
				{ ...body },
				{ new: true }
			).lean();
			AppResponse.updated(res, "updated");
			// AppResponse.success(res, organization);
		} catch (e) {
			AppResponse.fail(res, e);
		}
	}

	async deleteOrganization(req: Request, res: Response) {
		const { id } = req.query;
		try {
			const organization = await OrganizationModel.findById(id);
			//@ts-ignore
			if (organization?.brand.url.length > 0) {
				//@ts-ignore
				await deleteFromCloud(organization?.brand.url);
			}

			await OrganizationModel.findByIdAndDelete(id);
		} catch (e) {
			AppResponse.fail(res, e);
		}
	}

	async addMembers(req: Request, res: Response) {
		const { body, user } = req;

		try {
			const { members, id }: IData = body;
			await OrganizationModel.findByIdAndUpdate(id, { $push: { members } });

			AppResponse.updated(res, "updated");
		} catch (e) {
			AppResponse.fail(res, e);
		}
	}

	async removeMembers(req: Request, res: Response) {
		const { id, members }: IData = req.body;

		try {
			await OrganizationModel.findByIdAndUpdate(id, { $pull: { members } });

			AppResponse.updated(res, "updated");
		} catch (e) {
			AppResponse.fail(res, e);
		}
	}

	async getAllOrganizations(req: Request, res: Response) {
		const { tab, sortBy, name } = req.query;

		try {
			const organizations = await OrganizationServices.getAllOrganization({
				tab,
				sortBy,
				name,
			});
			if (!organizations) return AppResponse.notFound(res);

			AppResponse.success(res, organizations);
		} catch (e) {
			AppResponse.fail(res, e);
		}
	}

	async updateExecutive(req: Request, res: Response) {
		const { body } = req;
		let updateObj = {};

		if (body.updateType === "remove") {
			updateObj = { $pull: { executives: body.members } };
		} else if (body.updateType === "add") {
			updateObj = { $push: { executives: body.members } };
		} else {
			AppResponse.fail(res, "provide valid update type");
		}

		try {
			await OrganizationModel.findByIdAndUpdate(body.id, updateObj);

			AppResponse.updated(res, "updated");
		} catch (e) {
			AppResponse.fail(res, e);
		}
	}
}

export default new OrganizationCntrl();
