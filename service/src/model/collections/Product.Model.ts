import { Schema, model, Document } from "mongoose";

export interface IProduct extends Document {
	name: string;
	description: string;
	initPrice: string;
	newPrice: string;
	currency: string;
	discount: string;
	image: object;
	specs: object;
	shopId: Schema.Types.ObjectId;
}

const productSchema = new Schema({
	name: {
		type: String,
		min: 3,
		max: 35,
		required: [true, "products must have a name"],
	},
	description: {
		type: String,
		min: [5, "give a valid description for a product"],
		max: [400, "you don't want to get your customers bored"],
		required: true,
	},
	initPrice: {
		type: String,
		required: true,
	},
	newPrice: {
		type: String,
	},
	discount: {
		type: Number,
		required: false,
		default: 0,
	},
	image: {
		url: String,
		publicId: String,
	},
	specs: {
		color: String,
		extraInfo: String,
	},
	shopId: {
		type: Schema.Types.ObjectId,
		ref: "Shop",
		required: true,
	},
});

const productModel = model<IProduct>("Product", productSchema);

export default productModel;
