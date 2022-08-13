import { Schema, model, Document } from "mongoose";

export interface IOrder extends Document {
	products: [
		{
			product: object;
			quantity: number;
		}
	];
	user: {
		email: string;
		userId: Schema.Types.ObjectId;
	};
	valid: boolean;
	payment: object;
	paymentId: string;
}

const orderSchema = new Schema({
	products: [
		{
			product: {
				type: Object,
				required: true,
			},
			quantity: {
				type: Number,
				required: true,
			},
		},
	],
	user: {
		email: {
			type: String,
			required: true,
		},
		userId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: "USER",
		},
	},
	valid: {
		type: Boolean,
		default: false,
	},
	payment: {
		totalCost: Number,
		paymentMethod: String,
		date: Date,
		status: {
			type: String,
			enum: ["PAID", "NOT-PAID"],
			default: "NOT-PAID",
		},
	},
	paymentId: {
		type: String,
	},
});

export default model<IOrder>("Order", orderSchema);
