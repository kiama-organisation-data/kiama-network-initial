import unique from "../../libs/randomGen";
import { InfoCommentModel } from "../../model/comments/Organization.Model";
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
		return { organizations, count };
	};

	// -----------------------------------------------------------//
	// comments service for infoModel begins here
	// -----------------------------------------------------------//

	findCommentById = async (commentId: string) => {
		const comment = await InfoCommentModel.findById(commentId)
			.populate("author", "name avatar")
			.populate("replies", "author comment parentId")
			.lean();

		return comment;
	};

	findCommentByIdAndUpdate = async (data: any) => {
		const { comment, commentId } = data;
		const newComment = await InfoCommentModel.findByIdAndUpdate(commentId, {
			comment,
		}).lean();

		return newComment;
	};

	updateComment = async (data: any) => {
		const { parentId, comment } = data;
		await InfoCommentModel.findByIdAndUpdate(parentId, {
			$pull: { replies: comment._id },
			$inc: { totalReplies: -1 },
		});
		return true;
	};

	updateInfo = async (data: any) => {
		const { comment, commentId } = data;
		const updatedInfo = await InfoCommentModel.findByIdAndUpdate(
			{ _id: comment.infoId },
			{
				$pull: { comments: commentId },
				$inc: { commentCount: -1 },
			},
			{ new: true }
		);
		return updatedInfo;
	};

	getAllComments = async (tab: number, sortBy: string, infoId: string) => {
		const currentTab = tab || 1;
		const perTab = 20;
		let totalComments = 0;
		const count = await InfoCommentModel.find({ infoId }).countDocuments();
		totalComments = count;
		let sort;

		if (sortBy === "latest" || "") {
			sort = { createdAt: -1 };
		} else if (sortBy === "oldest") {
			sort = { createdAt: 1 };
		}

		const comments = await InfoCommentModel.find({ infoId })
			.skip((+currentTab - 1) * perTab)
			.limit(perTab)
			.sort(sort)
			.lean();
		return { totalComments, comments };
	};
}

export default new OrganizationService();
