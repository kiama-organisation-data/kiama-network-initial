import { hash } from "bcrypt";
import { Request, Response } from "express";
import joiValidation from "../libs/joiValidation";
import Users, { IUser } from "../model/users/UsersAuth.Model";
import WalletModel, { IWallet } from "../model/Wallet.Model";
import AppResponse from "../services";
import { apiCrypto } from "../utils/CrytoUtils";

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
 * totalRoutes: 7
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
			let serialKey: string = "";

			if (count === 0) {
				serialKey = "kw-00x-000001";
			} else if (count < 10) {
				serialKey = "kw-000x-00000" + (count + 1);
			} else if (count > 10 && count < 100) {
				serialKey = "kw-00x-0000" + (count + 1);
			} else if (count > 1000 && count < 10000) {
				serialKey = "kw-00x-000" + (count + 1);
			} else if (count > 10000) {
				serialKey = "kw-00x-00" + (count + 1);
			}
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
			console.log(value);
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
			const wallet: IWallet | null = await WalletModel.findOne({ from });
			const value: any | undefined = await wallet?.deductKmcOrKmp(
				coinOrPoints,
				unit,
				details
			);
			const toWallet: IWallet | null = await WalletModel.findOne({ to });

			const receiversValue: any | undefined = await toWallet?.addTokmpOrKmc(
				coinOrPoints,
				unit,
				details
			);

			AppResponse.success(res, { value, receiversValue });
		} catch (e) {
			AppResponse.fail(res, e);
		}
	};
}

export default new WalletController();
