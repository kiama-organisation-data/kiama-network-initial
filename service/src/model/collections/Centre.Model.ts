import { Schema, model, Document } from "mongoose";

export interface ICentreRoom extends Document {
	category: String;
	required: [true, "User's id must be provided"];
	user: Schema.Types.ObjectId;
	collectionId: Schema.Types.ObjectId;
	purpose: string;
}

const centreSchema = new Schema(
	{
		user: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: [true, "User's id must be provided"],
		},
		collectionId: {
			type: Schema.Types.ObjectId,
			ref: "Shop",
			required: [true, "Collection's id must be provided"], // referencing shop for now
		},
		category: {
			type: String,
			enum: ["shop"], // others will be added later example: blog
			required: true,
		},
		purpose: {
			type: String,
			required: [true, "This fiels is required for more clarity on your shop"],
			min: 40,
		},
	},
	{ timestamps: true, toJSON: { virtuals: true } }
);

export default model<ICentreRoom>("Centre", centreSchema);
