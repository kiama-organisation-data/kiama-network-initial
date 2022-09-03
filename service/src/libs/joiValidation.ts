import Joi, { number, string } from "@hapi/joi";
import { IChallenge } from "../model/Challenges.Model";
import { IChannel } from "../model/Channels.Model";
import { IProduct } from "../model/collections/Product.Model";
import { IShop } from "../model/collections/Shop.Model";
import { IPrmsg } from "../model/Messages.Model";
import { IPchannel } from "../model/Posts.Channels";
import { IPost } from "../model/Posts.Model";
import { IProfile } from "../model/users/Profiles.Model";
import { IUser } from "../model/users/UsersAuth.Model";
import { IWallet } from "../model/Wallet.Model";
export interface Iparam {
	page: string;
	sortBy: string;
	device: string;
}

export interface IAddOrRemoveWallet {
	userId: string;
	unit: number;
	coinOrPoints: string;
	details: {
		sender: string;
		reason: string;
		date: Date;
	};
}
class JoiValidate {
	constructor() { }

	// signup verification
	signupValidation = (data: IUser) => {
		const usersShema = Joi.object({
			name: Joi.object({
				first: Joi.string().required(),
				last: Joi.string().required(),
			}),
			username: Joi.string().required(),
			avatar: Joi.string(),
			email: Joi.string(),
			password: Joi.string().min(6).required(),
			role: Joi.string().required(),
			personalAbility: Joi.array(),
			status: Joi.string(),
			birthday: Joi.date(),
			gender: Joi.string(),
		});
		return usersShema.validate(data);
	};

	// login verification
	loginValidation = (data: IUser) => {
		const usersShema = Joi.object({
			email: Joi.string().required(),
			password: Joi.string().min(6).required(),
		});
		return usersShema.validate(data);
	};

	updatePasswordValidation = (data: IUser) => {
		const usersShema = Joi.object({
			_id: Joi.string().required(),
			name: Joi.string().required(),
			username: Joi.string(),
			email: Joi.string(),
			password: Joi.string().min(6).required(),
			role: Joi.string().required(),
			personalAbility: Joi.array(),
			status: Joi.string(),
			createdAt: Joi.date(),
			updatedAt: Joi.date(),
			__v: Joi.number(),
			newPassworda: Joi.string(),
			oldPassword: Joi.string().min(6).required(),
			newPassword: Joi.string().min(6).required(),
		});
		return usersShema.validate(data);
	};

	uploadFileValidation = (data: IPost) => {
		const postSchema = Joi.object({
			title: Joi.string().required().trim(),
		});
		return postSchema.validate(data);
	};

	sendPriMsgValidation = (data: IPrmsg) => {
		const postSchema = Joi.object({
			message: Joi.string(),
			from: Joi.array(),
			to: Joi.string(),
		});
		return postSchema.validate(data);
	};

	channelsValidation = (data: IChannel) => {
		const postSchema = Joi.object({
			name: Joi.string().required(),
			description: Joi.string().required(),
			email: Joi.string().required(),
			category: Joi.string().required(),
		});
		return postSchema.validate(data);
	};

	channelsEditValidation = (data: IChannel) => {
		const postSchema = Joi.object({
			name: Joi.string(),
			description: Joi.string(),
			category: Joi.string(),
		});
		return postSchema.validate(data);
	};

	channelsCreatePostValidation = (data: IPchannel) => {
		const postSchema = Joi.object({
			description: Joi.string().required(),
		});
		return postSchema.validate(data);
	};

	channelQueryValidation = (data: Iparam) => {
		const gettShema = Joi.object({
			page: Joi.string(),
			sortBy: Joi.string(),
			device: Joi.string(),
		});
		return gettShema.validate(data);
	};

	shopCreationValidation = (data: IShop) => {
		const postSchema = Joi.object({
			name: Joi.string().required(),
			email: Joi.string().trim().required(),
			mobile: Joi.string().required(),
			country: Joi.string().required(),
			city: Joi.string().required(),
			purpose: Joi.string().required().min(40),
		});
		return postSchema.validate(data);
	};

	productCreationValidation = (data: IProduct) => {
		const postSchema = Joi.object({
			name: Joi.string().min(3).max(35).required(),
			description: Joi.string().min(5).max(400).required(),
			initPrice: Joi.string().required().trim(),
			currency: Joi.string().trim().required(),
			discount: Joi.number(),
			//   specs: Joi.object({
			color: Joi.string(),
			extraInfo: Joi.string().min(10),
			//   }),
		});
		return postSchema.validate(data);
	};

	productEditValidation = (data: IProduct) => {
		const postSchema = Joi.object({
			description: Joi.string().min(5).max(400),
			name: Joi.string().min(3),
			//   specs: Joi.object({
			color: Joi.string(),
			extraInfo: Joi.string().min(10),
			//   }),
		});
		return postSchema.validate(data);
	};

	walletCreationValidation = (data: IWallet) => {
		const postSchema = Joi.object({
			password: Joi.string().min(6).trim().required(),
		});
		return postSchema.validate(data);
	};

	walletUpdatePassValidation = (data: IWallet) => {
		const postSchema = Joi.object({
			newPassword: Joi.string().min(6).trim().required(),
			oldPassword: Joi.string().min(6).trim().required(),
		});
		return postSchema.validate(data);
	};

	walletAddOrRemoveAmountValidation = (data: IAddOrRemoveWallet) => {
		const postSchema = Joi.object({
			userId: Joi.string().trim().required(),
			coinOrPoints: Joi.string().trim().required(),
			unit: Joi.number().min(1).required(),
			details: Joi.object({
				reason: Joi.string().required(),
				sender: Joi.string().trim().required(),
				date: Joi.date(),
			}),
		});
		return postSchema.validate(data);
	};

	challengeValidation = (data: IChallenge) => {
		const postSchema = Joi.object({
			creator: Joi.string(),
			title: Joi.string().required(),
			description: Joi.string(),
			category: Joi.string().required(),
			startDate: Joi.date(),
			endDate: Joi.date(),
			duration: Joi.number(),
			maxParticipants: Joi.number(),
			minParticipants: Joi.number(),
			tags: Joi.array(),
			image: Joi.string(),
			video: Joi.string(),
			isPrivate: Joi.boolean(),
			isActive: Joi.boolean(),
			isVerified: Joi.boolean(),
			isPublished: Joi.boolean(),
			isDeleted: Joi.boolean(),
		})
		return postSchema.validate(data);
	}
}

// create new validation class and call it into 
class profileValidation extends JoiValidate {
	constructor() {
		super();
	}

	// profile eduction validation
	educationValidation = (data: IProfile) => {
		const postSchema = Joi.object({
			school: Joi.string().required(),
			degree: Joi.string().required(),
			fieldOfStudy: Joi.string().required(),
			from: Joi.date().required(),
			to: Joi.date().required(),
			current: Joi.boolean().required(),
			description: Joi.string(),
		});
		return postSchema.validate(data);
	}

	experienceValidation = (data: IProfile) => {
		const postSchema = Joi.object({
			company: Joi.string().required(),
			title: Joi.string().required(),
			location: Joi.string().required(),
			from: Joi.date().required(),
			to: Joi.date().required(),
			current: Joi.boolean().required(),
			description: Joi.string(),
		});
		return postSchema.validate(data);
	}
}

const joiValidation = new profileValidation();
export default joiValidation;
