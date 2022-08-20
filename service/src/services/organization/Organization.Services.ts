import unique from "../../libs/randomGen";
import OrganizationModel from "../../model/organizations/Organization.Model";

interface IParams {
	tab: number;
	sortBy: string;
	name: string;
}

class OrganizationService {
	constructor() {}

	saveOrganization = async (data: any, user: string | undefined) => {
		const uniqueId = `kia-org-${unique()}-id`;
		const organization = await OrganizationModel.create({
			...data,
			uniqueId,
			members: [user],
			executives: [user],
		});

		return organization;
	};
	getAllOrganization = async ({ tab, sortBy, name }: IParams) => {
		const currentTab = +tab || 1;
		let search = {};
		let sort: any = {};

		if (name) {
			const searchRegex = new RegExp(name, "ig");
			search = { name: searchRegex };
		}

		switch (sortBy) {
			case "latest":
				sort = { createdAt: -1 };
				break;
			case "newest":
				sort = { createdAt: 1 };
			default:
				sort = { createdAt: -1 };
				break;
		}
		const count = await OrganizationModel.find(search).count();

		const organizations = await OrganizationModel.find(search)
			.sort(sort)
			.skip((currentTab - 1) * 6)
			.limit(6)
			.lean();
		return organizations;
	};
}

export default new OrganizationService();
