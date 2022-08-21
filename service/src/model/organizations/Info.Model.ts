import { Schema, model, Document } from "mongoose";

export interface IInfo extends Document {
	heading: string;
	body: string;
	url: string;
	publicId: string;
	fileType: string;
	isFile: boolean;
	views: Array<any>;
	creator: string;
	organization: Array<any>;
	comments: Array<any>;
	commentCount: number;
}

const infoSchema = new Schema({
	heading: {
		type: String,
		required: false,
		minlength: 2,
	},
	body: {
		type: String,
		required: true,
		minlength: 3,
	},
	url: String,
	publicId: String,
	fileType: String, // video || image
	isFile: Boolean,
	views: [
		{
			counts: {
				type: Number,
				min: 0,
			},
			viewers: {
				type: Schema.Types.ObjectId,
				ref: "User",
			},
		},
	],
	creator: {
		type: String,
		required: true,
	},
	organization: [
		{
			type: Schema.Types.ObjectId,
			ref: "Organization",
			required: true,
		},
	],
	comments: [
		{
			type: Schema.Types.ObjectId,
			ref: "CommentInfo",
		},
	],
	commentCount: Number,
});

export default model<IInfo>("Info", infoSchema);
