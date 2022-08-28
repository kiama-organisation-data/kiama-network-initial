import { Schema, model, Document } from "mongoose";

export interface IProposal extends Document {
	content: string;
	userId: string;
	target: string;
	expiresAt: Date;
}

const proposalSchema = new Schema({
	userId: {
		type: Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	content: {
		type: String,
		required: true,
		minlength: 1,
	},
	target: {
		type: String,
		enum: ["all", "africa"],
		default: "all",
		required: true,
	},
	expiresAt: {
		type: Date,
		required: true,
	},
});

export default model<IProposal>("Proposal", proposalSchema);
