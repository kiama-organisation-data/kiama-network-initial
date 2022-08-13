import { Schema, model, Document } from "mongoose";
// import { pagePostModel } from "./Posts.Model";

export interface IPage extends Document {
	image: object;
	name: string;
	description: string;
	moderators: Array<any>;
	visitors: Array<any>;
	likes: object;
	email: string;
	mobile: string;
	country: string;
	rating: number;
	addLikes(userId: any): Promise<Boolean>;
	removeLikes(userId: any): Promise<Boolean>;
	removeModerator(moderatorId: any): Promise<Boolean>;
	automateRating(): Promise<Number>;
}

/**
 * @interface Ipage at removeModerator, in the future will be set to remove entirely and not
 * replace with empty string
 * @interface Ipage at removeLikes is currently not efficient for more than 50 likes
 * @interface Ipage automateRating in the future would use cron job to automate tast
 */

const pagesSchema = new Schema(
	{
		image: {
			publicId: {
				type: String,
				required: true,
			},
			url: {
				type: String,
				required: true,
			},
		},
		name: {
			type: String,
			required: [true, "name is required"],
		},
		description: {
			type: String,
			required: true,
		},
		moderators: {
			type: Array,
			required: true,
		},
		creator: {
			type: Schema.Types.ObjectId,
			required: true,
		},
		visitors: [
			{
				type: Schema.Types.ObjectId,
				ref: "User",
			},
		],
		likes: {
			userId: [
				{
					type: Schema.Types.ObjectId,
				},
			],
			count: {
				type: Number,
				default: 0,
			},
		},
		email: {
			type: String,
			required: true,
		},
		mobile: {
			type: String,
			required: true,
		},
		country: {
			type: String,
			required: true,
		},
		rating: Number,
	},
	{ timestamps: true }
);

pagesSchema.methods.removeModerator = async function (
	moderatorId: any
): Promise<Boolean> {
	for (let i = 0; i < this.moderators.length; i++) {
		if (this.moderators[i] === moderatorId) {
			this.moderators[i] === moderatorId;
			this.moderators[i] = "";
			this.save();
		}
	}
	return true;
};

pagesSchema.methods.addLikes = async function (userId: any): Promise<Boolean> {
	this.likes.userId.push(userId.toString());
	this.likes.count = this.likes.count + 1;
	this.rating = await this.automateRating();
	this.save();
	return true;
};

pagesSchema.methods.removeLikes = async function (
	userId: any
): Promise<Boolean> {
	for (let i = 0; i < this.likes.userId.length; i++) {
		if (this.likes.userId[i] === userId.toString()) {
			this.likes.count = this.likes.count - 1;
			this.likes.userId[i] = "";
			this.save();
		}
	}
	return true;
};

pagesSchema.methods.automateRating = async function (): Promise<Number> {
	// const totalPost = pagePostModel.find({ pageId: this._id}).countDocuments({});
	let rating: number = 0;
	const count = this.likes.count;
	if (count < 21) rating = 1.0;
	if (count < 51 && count > 21) rating = 1.5;
	if (count < 101 && count > 51) rating = 2.0;
	if (count < 151 && count > 101) rating = 2.5;
	if (count < 201 && count > 151) rating = 3.0;
	if (count < 301 && count > 201) rating = 3.5;
	if (count < 401 && count > 301) rating = 4.0;
	if (count < 501 && count > 401) rating = 4.5;
	if (count < 651 && count > 501) rating = 5.0;
	if (count < 851 && count > 651) rating = 5.5;
	if (count < 1051 && count > 851) rating = 6.0;
	if (count < 2001 && count > 1051) rating = 6.5;
	if (count < 2551 && count > 2001) rating = 7.0;
	if (count < 3051 && count > 2551) rating = 7.5;
	if (count < 4051 && count > 3051) rating = 8.0;
	if (count < 5001 && count > 4051) rating = 8.5;
	if (count < 6051 && count > 5001) rating = 9.0;
	if (count < 7051 && count > 6051) rating = 9.5;
	if (count > 7051) rating = 9.9;
	this.rating = rating;
	return rating;
};

const pageModel = model<IPage>("Page", pagesSchema);
export default pageModel;
