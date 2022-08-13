import { model, Schema, Document } from "mongoose";

export interface IPchannel extends Document {
	channelId: Schema.Types.ObjectId;
	uniqueKey: string;
	publicKey: string;
	video: object;
	image: object;
	creator: Schema.Types.ObjectId;
	views: number;
	reactions: string;
	category: string;
	comments: Array<any>;
	commentCount: number;
}

const channelPostSchema = new Schema({
	channelId: {
		type: Schema.Types.ObjectId,
		required: true,
	},
	uniqueKey: {
		type: String,
		required: true,
		unique: true,
	},
	publicKey: {
		type: String,
		unique: true,
	},
	video: {
		description: {
			type: String,
			min: [20, "description is too short"],
		},
		publicId: String,
		url: String,
		tags: Array,
	},
	image: {
		description: {
			type: String,
			min: [20, "description is too short"],
		},
		publicId: String,
		url: String,
		tags: Array,
	},
	category: {
		type: String,
		enum: ["tech", "entertainment", "politics", "news"],
		required: true,
	},
	views: {
		type: Number,
		default: 0,
	},
	reactions: {
		type: String,
		enum: ["love", "dislike", "clap", "wow"],
		userId: Schema.Types.ObjectId,
	},
	creator: {
		type: Schema.Types.ObjectId,
	},
	comments: [{ type: Schema.Types.ObjectId, ref: "CommentChannel" }],
	commentCount: {
		type: Number,
		default: 0,
	},
});

const channelPostModel = model<IPchannel>("ChannelPost", channelPostSchema);

export default channelPostModel;
