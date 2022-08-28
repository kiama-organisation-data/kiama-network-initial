import { hash } from "bcrypt";
import { Request, Response } from "express";
import joiValidation from "../libs/joiValidation";
import Users, { IUser } from "../model/users/UsersAuth.Model";
import WalletModel, { IWallet } from "../model/Wallet.Model";
import AppResponse from "../services";
import { apiCrypto } from "../utils/CrytoUtils";
import MidFuncs from "../functions";
import Notifications from "../model/Notifications.Model";

/**
 *
 * Note: all rotes are appended to host api: http://localhost:port/kiama-network/api/v1
 * @function createUserWallet   /wallet/create                   -- post request
 * @function getUserWallet      /wallet                          -- get request
 * @function updatePassword     /wallet/update-password          -- patch request
 * @function verifyOwnerOfAccount      /wallet/verify            -- post request
 * @function updateKiamaPointOrCoin    /wallet/update-amount     -- patch request
 * @function deductKiamaPointOrCoin    /wallet/deduct-amount     -- patch request
 * @function suspendOrUnsuspendWallet  /wallet/toggle-suspension -- patch request
 * @function makeTransaction           /wallet/transact          -- patch request
 * @function deleteUserWallet          /wallet                   -- delete request
 * totalRoutes: 8
 */

class WalletController {
	constructor() {}

	createUserWallet = async (req: Request, res: Response) => {
		const { body, user } = req;
		const { error } = joiValidation.walletCreationValidation(body);

		if (error) return AppResponse.fail(res, error.message);

		try {
			const details: IUser | null = await Users.findById(user);

			if (!details) return AppResponse.notFound(res);

			const secretKey = await apiCrypto.hashParamJwt(
				details._id.toString(),
				//@ts-ignore
				details.fullName
			);
			const count = await WalletModel.find().count();

			const serialKey = MidFuncs.WalletFunctions(count);

			const wallet: IWallet = await WalletModel.create({
				// @ts-ignore
				name: details.fullName,
				secretKey,
				valid: true,
				userId: user,
				password: await hash(body.password, 12),
				serialNumber: serialKey,
			});

			details.walletId = wallet._id;

			details.save();
			//@ts-ignore
			delete wallet.password;

			AppResponse.success(res, wallet);
		} catch (err) {
			AppResponse.fail(res, err);
		}
	};

	getUserWallet = async (req: Request, res: Response) => {
		const { user: userId } = req;

		try {
			const wallet = await WalletModel.findOne({ userId }).lean();

			if (!wallet) return AppResponse.notFound(res);
			//@ts-ignore
			delete wallet.password;

			AppResponse.success(res, wallet);
		} catch (e) {
			AppResponse.fail(res, e);
		}
	};

	updatePassword = async (req: Request, res: Response) => {
		const { user: userId, body } = req;

		const { error } = joiValidation.walletUpdatePassValidation(body);

		if (error) AppResponse.fail(res, error.message);

		try {
			const wallet: IWallet | null = await WalletModel.findOne({ userId });
			const validatePassword = await wallet?.validatePassword(body.oldPassword);

			if (!validatePassword)
				return AppResponse.fail(res, "you don't have access to this account");

			//@ts-ignore
			wallet?.password = await hash(body.newPassword, 12);

			wallet?.save();

			AppResponse.updated(res, "updated");
		} catch (e) {
			AppResponse.fail(res, e);
		}
	};

	verifyOwnerOfAccount = async (req: Request, res: Response) => {
		const { user: userId, body } = req;

		const { error } = joiValidation.walletCreationValidation(body);

		if (error) return AppResponse.fail(res, error.message);

		try {
			const user = await WalletModel.findOne({ userId });

			const validate = await user?.validatePassword(body.password);

			if (!validate) {
				AppResponse.fail(res, "not account owner");
			} else {
				AppResponse.success(res, "Is user");
			}
		} catch (e) {
			AppResponse.fail(res, e);
		}
	};

	updateKiamaPointOrCoin = async (req: Request, res: Response) => {
		const { error } = joiValidation.walletAddOrRemoveAmountValidation(req.body);
		const { userId, details, coinOrPoints, unit } = req.body;

		if (error) return AppResponse.fail(res, error.message);
		try {
			const wallet: IWallet | null = await WalletModel.findOne({ userId });

			const value: any | undefined = await wallet?.addTokmpOrKmc(
				coinOrPoints,
				unit,
				details
			);
			if (value !== "success") return AppResponse.fail(res, value);

			const notificationObj = {
				user: userId,
				notification: "kiama wallet",
				type: "wallet",
				link: "http://localhost:kiama-network/api/v1/wallet",
				icon: "transaction icon",
			};
			await Notifications.create({
				...notificationObj,
				content: `your kiama account has been credited ${unit}units of kiama-${coinOrPoints}`,
			});

			AppResponse.updated(res, "updated");
		} catch (e) {
			AppResponse.fail(res, e);
		}
	};

	deductKiamaPointOrCoin = async (req: Request, res: Response) => {
		const { error } = joiValidation.walletAddOrRemoveAmountValidation(req.body);

		const { userId, details, coinOrPoints, unit } = req.body;

		if (error) return AppResponse.fail(res, error.message);
		try {
			const wallet: IWallet | null = await WalletModel.findOne({ userId });
			const value: any | undefined = await wallet?.deductKmcOrKmp(
				coinOrPoints,
				unit,
				details
			);

			const notificationObj = {
				user: userId,
				notification: "kiama wallet",
				type: "wallet",
				link: "http://localhost:kiama-network/api/v1/wallet",
				icon: "transaction icon",
			};
			await Notifications.create({
				...notificationObj,
				content: `your kiama account has been debited ${unit}units of kiama-${coinOrPoints}`,
			});

			if (value !== "success") return AppResponse.fail(res, value);

			AppResponse.updated(res, "updated");
		} catch (e) {
			AppResponse.fail(res, e);
		}
	};

	suspendOrUnsuspendWallet = async (req: Request, res: Response) => {
		const { userId } = req.query;

		try {
			const wallet = await WalletModel.findOne({ userId });
			//@ts-ignore
			wallet?.suspended = !wallet?.suspended;
			await wallet?.save();

			AppResponse.updated(res, "updated");
		} catch (e) {
			AppResponse.fail(res, e);
		}
	};

	makeTransaction = async (req: Request, res: Response) => {
		const { from, to, unit, details, coinOrPoints } = req.body;

		try {
			const wallet: IWallet | null = await WalletModel.findOne({
				userId: from,
			});
			const value: any | undefined = await wallet?.deductKmcOrKmp(
				coinOrPoints,
				unit,
				details
			);
			const toWallet: IWallet | null = await WalletModel.findOne({
				userId: to,
			});

			const receiversValue: any | undefined = await toWallet?.addTokmpOrKmc(
				coinOrPoints,
				unit,
				details
			);

			const notificationObj = {
				user: from,
				notification: "transaction successful",
				type: "wallet",
				link: "http://localhost:kiama-network/api/v1/wallet",
				icon: "transaction icon",
			};
			await Notifications.create({
				...notificationObj,
				content: `your transfer of ${unit} units of kiama ${coinOrPoints} to ${toWallet?.name} was successful`,
			});

			await Notifications.create({
				...notificationObj,
				content: `you received ${unit} units of kiama ${coinOrPoints} from ${wallet?.name}`,
			});

			AppResponse.success(res, { value, receiversValue });
		} catch (e) {
			AppResponse.fail(res, e);
		}
	};

	deleteUserWallet = async (req: Request, res: Response) => {
		const { user: userId } = req;

		try {
			await WalletModel.deleteOne({ userId });

			AppResponse.success(res, "deleted");
		} catch (e) {
			AppResponse.fail(res, e);
		}
	};
}

export default new WalletController();
