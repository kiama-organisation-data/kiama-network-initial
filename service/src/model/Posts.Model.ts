import mongoose, { Schema } from "mongoose";

const schema: any = mongoose.Schema;

/**
 * @param interface will be updated in the future
 * the model in the future will be updated to accept replys
 */
export interface IPost extends mongoose.Document {
	title: string;
	fileUrl: Array<string>;
	fileType: Array<string>;
	publicId: string;
	userId: Schema.Types.ObjectId;
}

export interface IPagepost extends mongoose.Document {
	content: object;
	pageId: Schema.Types.ObjectId;
	tags: Array<Schema.Types.ObjectId>;
}

const postSchema = new schema(
	{
		title: {
			type: String,
		},
		publicId: {
			type: String || null,
		},
		fileType: {
			type: Array,
			required: true,
		},
		fileUrl: Array,
		userId: {
			type: schema.Types.ObjectId,
			ref: "User",
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

export const pagePostModel = mongoose.model<IPagepost>(
	"PagePost",
	pagePostSchema
);
const postModel = mongoose.model<IPost>("Posts", postSchema);
export default postModel;
