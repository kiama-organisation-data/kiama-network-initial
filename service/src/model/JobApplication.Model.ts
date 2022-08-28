import { Schema, model, Document } from "mongoose";

export interface IJobApp extends Document {
	publicId: string;
	url: string;
	jobPostId: string;
	userId: string;
	text: string;
}

const applicationSchema = new Schema({
	publicId: {
		type: String,
		required: true,
	},
	url: {
		type: String,
		required: true,
	},
	jobPostId: {
		type: Schema.Types.ObjectId,
		ref: "Job",
		required: true,
	},
	userId: {
		type: Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	text: {
		type: String,
		required: false,
	},
});

export default model<IJobApp>("JobApp", applicationSchema);
