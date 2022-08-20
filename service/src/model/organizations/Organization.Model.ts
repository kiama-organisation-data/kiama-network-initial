import { Schema, model, Document } from "mongoose";

export interface IOrganization extends Document {
	name: string;
	brand: {
		url: string;
		publicId: string;
	};
	description: string;
	uniqueId: string;
	messages: Array<any>;
	info: Array<any>;
	members: Array<any>;
	executives: Array<any>;
	rules: string;
	public: boolean;
}

const organizationSchema = new Schema({
	name: {
		type: String,
		required: true,
		minlength: 2,
		maxlength: 30,
	},
	brand: {
		publicId: String,
		url: String,
	},
	description: {
		type: String,
		minlength: 100,
		maxlength: 800,
		required: true,
	},
	uniqueId: {
		type: String,
		unique: true,
		required: true,
	},
	rules: {
		type: String,
		required: [true, "set rules that govern your organization"],
	},
	public: {
		type: Boolean,
		default: false,
	},
	messages: [
		{
			type: Schema.Types.ObjectId,
			ref: "OrganizationMsg",
		},
	],
	members: [
		{
			type: Schema.Types.ObjectId,
			ref: "User",
		},
	],
	executives: [
		{
			type: Schema.Types.ObjectId,
			ref: "User",
		},
	],
	info: [
		{
			type: Schema.Types.ObjectId,
			ref: "Info",
		},
	],
});

export default model<IOrganization>("IOrganization", organizationSchema);
