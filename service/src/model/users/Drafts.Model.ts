import { Schema, model, Document } from "mongoose";

export interface IDraft extends Document {
	userId: string;
	text: string;
}

const draftSchema = new Schema(
	{
		userId: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		text: {
			type: String,
			required: true,
		},
	},
	{
		timestamps: true,
		toJSON: {
			virtuals: true,
		},
	}
);

export default model<IDraft>("Draft", draftSchema);
