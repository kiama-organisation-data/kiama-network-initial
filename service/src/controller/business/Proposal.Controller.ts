import { Request, Response } from "express";
import ProposalsModel, {
	IProposal,
} from "../../model/business/Proposals.Model";
import AppResponse from "../../services";

interface IBody {
	target: string;
	content: string;
}

class ProposalCntrl {
	constructor() {}

	createProposal = async (req: Request, res: Response) => {
		const { user: userId } = req;
		const body: IBody = req.body;

		const expiresAt: Date = new Date();
		expiresAt.setDate(expiresAt.getDate() + 28);

		try {
			const proposal = await ProposalsModel.create({
				...body,
				userId,
				expiresAt,
			});

			AppResponse.created(res, proposal);
		} catch (e) {
			AppResponse.fail(res, e);
		}
	};

	getProposals = async (req: Request, res: Response) => {
		const { userId } = req.params;
		const { page, target } = req.query;

		const currentPage = +page || 1;
		const perPage = 6;

		try {
			const totalProposals = await ProposalsModel.find({
				$and: [{ userId }, { target }],
			}).countDocuments();

			const proposals = await ProposalsModel.find({
				$and: [{ userId }, { target }],
			})
				.skip((currentPage - 1) * perPage)
				.limit(perPage)
				.sort({ createdAt: 1 })
				.populate("userId", "name avatar")
				.lean();

			if (!proposals) return AppResponse.notFound(res);

			AppResponse.success(res, { proposals, totalProposals });
		} catch (e) {
			AppResponse.fail(res, e);
		}
	};

	getProposal = async (req: Request, res: Response) => {
		const { proposalId } = req.query;

		try {
			const proposal = await ProposalsModel.findById(proposalId)
				.populate("userId", "name avatar")
				.lean();

			if (!proposal) return AppResponse.notFound(res);

			AppResponse.success(res, proposal);
		} catch (e) {
			AppResponse.fail(res, e);
		}
	};

	getAllProposals = async (req: Request, res: Response) => {
		const { target } = req.query;
		const { page } = req.params;

		let proposals: any;
		const currentPage = +page || 1;
		const perPage = 6;

		proposals = await ProposalsModel.find({ target })
			.skip((currentPage - 1) * perPage)
			.limit(perPage)
			.sort({ createdAt: 1 })
			.lean();
		const totalProposals = await ProposalsModel.find({ target }).countDocuments(
			{}
		);

		if (!proposals) return AppResponse.notFound(res);

		AppResponse.success(res, proposals, totalProposals);
	};

	deleteProposal = async (req: Request, res: Response) => {
		const { proposalId } = req.query;

		try {
			await ProposalsModel.deleteOne({ _id: proposalId });

			AppResponse.updated(res, "deleted");
		} catch (e) {
			AppResponse.fail(res, e);
		}
	};
}

export default new ProposalCntrl();
