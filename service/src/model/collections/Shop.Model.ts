import { Schema, model, Document } from "mongoose";

export interface IShop extends Document {
	name: string;
	email: string;
	owner: string;
	mobile: string;
	country: string;
	city: string;
	brand: object;
	credentials: object;
	customers: Array<any>;
	products: Array<any>;
	activity: string;
	approved: boolean;
	account: {
		cardNumber: string;
		expiryMnth: string;
		expiryYear: string;
		cvv: string;
	};
}

const shopSchema = new Schema(
	{
		name: { type: String, required: true, min: 4, max: 20 },
		email: {
			type: String,
			required: true,
			trim: true,
			lowercase: true,
		},
		owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
		mobile: { type: String, required: true, trim: true },
		country: { type: String, required: true },
		city: { type: String, required: true },
		activity: {
			type: String,
			default: "active",
			enum: ["active", "blocked", "suspended", "de-activated"],
		},
		approved: {
			type: Boolean,
			required: true,
			default: false,
		},
		brand: {
			url: {
				type: String,
				required: true,
			},
			publicId: {
				type: String,
				required: true,
			},
		},
		credentials: {
			secretKey: {
				type: String,
			},
		},
		customers: [
			{
				type: Schema.Types.ObjectId,
				ref: "User",
			},
		],
		products: [
			{
				type: Schema.Types.ObjectId,
				ref: "Product",
			},
		],
		account: {
			cardNumber: {
				type: String,
				minLength: 10,
			},
			cvv: {
				type: String,
				minLength: 3,
				maxLength: 3,
			},
			expiryMnth: {
				type: String,
				minLength: 2,
				maxLength: 2,
			},
			expiryYear: {
				type: String,
				minLength: 2,
				maxLength: 2,
			},
		},
	},
	{ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

const shopModel = model<IShop>("Shop", shopSchema);

export default shopModel;
