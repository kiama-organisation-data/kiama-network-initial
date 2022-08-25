import { Schema, model, Document } from "mongoose";

// implement cron job later

export interface IAds extends Document {
	sponsorId: string;
	fileType: string;
	publicId: string;
	url: string;
	importance: string;
	duration: string;
	target: string;
	valid: boolean;
	paymentCost: number;
	paymentStatus: string;
	expiresAt: Date;
}

const adSchema = new Schema({
	sponsorId: {
		type: Schema.Types.ObjectId,
		required: true,
	},
	fileType: {
		type: String,
		required: true,
	},
	publicId: {
		type: String,
		required: true,
	},
	url: {
		type: String,
		required: true,
	},
	duration: {
		type: String,
		required: true,
		enum: ["one-week", "two-weeks", "three-weeks", "four-weeks"],
		default: "one-week",
	},
	importance: {
		type: String,
		enum: ["normal", "very"],
		default: "normal",
	},
	target: {
		type: String,
		required: true,
		enum: ["all", "africa"],
	},
	valid: {
		type: Boolean,
		defualt: false,
	},
	paymentCost: {
		type: Number,
		default: 0.0,
	},
	paymentStatus: {
		type: String,
		default: "NOT-PAID",
		enum: ["NOT-PAID", "PAID"],
	},
	expiresAt: {
		type: Date,
		default: new Date(),
	},
});

export default model<IAds>("Ads", adSchema);
