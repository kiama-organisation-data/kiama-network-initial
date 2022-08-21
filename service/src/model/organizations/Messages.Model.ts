import { Schema, model, Document } from "mongoose";

export interface IOrgMsg extends Document {
	from: string;
	orgId: string;
	text: string;
	url: string;
	publicId: string;
	isFile: boolean;
	isText: boolean;
	fileType: string;
	reply: Array<object>;
	seen: {
		by: Array<any>;
		count: number;
	};
	reactions: {
		count: number;
		reactors: Array<any>;
		reaction: Array<string>;
	};
}

const messageSchema = new Schema({
	from: {
		type: Schema.Types.ObjectId,
		required: true,
		ref: "User",
	},
	orgId: {
		type: Schema.Types.ObjectId,
		required: true,
		ref: "Organization",
	},
	text: {
		type: String,
		required: false,
		minlength: 1,
	},
	url: String,
	publicId: String,
	reply: [{ type: Object }],
	isFile: {
		type: Boolean,
		default: false,
	},
	isText: {
		type: Boolean,
		default: false,
	},
	fileType: {
		type: String,
	},
	seen: [
		{
			by: {
				type: Schema.Types.ObjectId,
				ref: "User",
			},
			count: {
				type: Number,
				default: 0,
			},
		},
	],
	reaction: [
		{
			count: {
				type: Number,
				default: 0,
			},
			reactors: {
				type: Schema.Types.ObjectId,
				ref: "User",
			},
			reaction: [
				{
					type: String,
					enum: ["wow", "love", "dislike"],
				},
			],
		},
	],
});

export default model<IOrgMsg>("OrgMsg", messageSchema);
