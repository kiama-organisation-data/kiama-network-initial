import { Schema, model, Document } from "mongoose";

export interface IBlog extends Document {
	name: string;
	email: string;
	reviews: {
		likes: number;
		users: Array<any>;
	};
	posts: Array<any>;
	brand: {
		publicId: string;
		url: string;
	};
	owner: string;
	activity: string;
	approved: string;
}

const blogSchema = new Schema(
	{
		name: {
			type: String,
			unique: true,
			required: true,
		},
		email: {
			type: String,
			required: true,
			trim: true,
		},
		reviews: {
			likes: Number,
			users: [{ type: Schema.Types.ObjectId, ref: "User" }],
		},
		posts: [{ type: Schema.Types.ObjectId, ref: "BlogPost" }],
		brand: {
			publicId: String,
			url: String,
		},
		owner: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: "User",
		},
		activity: {
			type: String,
			enum: ["de-activated", "active"],
			default: "de-activated",
		},
		approved: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true, toJSON: { virtuals: true } }
);

export default model<IBlog>("Blog", blogSchema);
