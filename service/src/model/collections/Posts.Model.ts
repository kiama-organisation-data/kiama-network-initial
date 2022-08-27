//Blog Posts
import { number } from "@hapi/joi";
import { Schema, model, Document } from "mongoose";

export interface IBlogPost extends Document {
	blogId: string;
	title: string;
	description: string;
	content: string;
	comments: Array<any>;
	likes: {
		count: number;
		users: Array<any>;
	};
	publicId: string;
	url: string;
	split: number; // to know how to organize the grid
}

const postSchema = new Schema({
	blogId: {
		type: Schema.Types.ObjectId,
		ref: "Blog",
		required: true,
	},
	title: {
		type: String,
		required: true,
	},
	description: {
		type: String,
		required: false,
	},
	content: {
		type: String,
		required: true,
	},
	publicId: String,
	url: String,
	split: Number,
	likes: {
		count: Number,
		users: [{ type: Schema.Types.ObjectId, ref: "User" }],
	},
	comments: [{ type: Schema.Types.ObjectId, ref: "BlogComments" }],
});

export default model<IBlogPost>("BlogPost", postSchema);
