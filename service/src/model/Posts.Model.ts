import { Schema, Document, model } from "mongoose";

const schema: any = Schema;

/**
 * @param interface will be updated in the future
 * the model in the future will be updated to accept replys
 */
export interface IPost extends Document {
	texts: [
		{
			text: string;
		}
	];
	userId: string;
	urls: [
		{
			publicId: string;
			url: string;
		}
	];
}

export interface IPagepost extends Document {
	content: {
		image: {
			publicId: string;
			url: string;
		};
		video: {
			publicId: string;
			url: string;
		};
	};
	pageId: string;
	tags: Array<string>;
}

const postSchema = new schema(
	{
		texts: [
			{
				type: String,
			},
		],
		urls: [
			{
				publicId: String,
				url: String,
			},
		],
		userId: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
	},
	{ _id: true, timestamps: true, toJSON: { virtuals: true } }
);

const pagePostSchema = new Schema(
	{
		pageId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: "Page",
		},
		content: {
			image: {
				publicId: Array,
				url: Array,
				coverText: String,
			},
			video: {
				publicId: String,
				url: String,
				coverText: String,
			},
			text: {
				type: String,
			},
		},
		tags: Array,
	},
	{ timestamps: true }
);

export const pagePostModel = model<IPagepost>("PagePost", pagePostSchema);
export const postModel = model<IPost>("Posts", postSchema);
