import { Schema, model, Document } from "mongoose";

export interface IChanInfo extends Document {
	author: string;
	comment: string;
	parentId: Schema.Types.ObjectId;
	infoId: Schema.Types.ObjectId;
	replies: Schema.Types.ObjectId;
	totalReplies: number;
	reaction: Array<any>;
	reactionCount: number;
}

const commetSchema = new Schema(
	{
		author: {
			type: String,
			required: true,
			ref: "User",
		},

		comment: {
			type: String,
			required: true,
		},

		parentId: {
			type: Schema.Types.ObjectId,
			ref: "CommentInfo",
			default: null,
		},

		infoId: {
			type: Schema.Types.ObjectId,
			ref: "Info",
			default: null,
		},

		replies: [{ type: Schema.Types.ObjectId, ref: "CommentInfo" }],

		totalReplies: {
			type: Number,
			default: 0,
		},

		reaction: [{ reactor: Schema.Types.ObjectId, reaction: String }],
		//enum: ["clap", "love", "wow"],

		reactionCount: {
			type: Number,
			default: 0,
		},
	},
	{ timestamps: true, toJSON: { virtuals: true } }
);

export const InfoCommentModel = model<IChanInfo>("CommentInfo", commetSchema);
