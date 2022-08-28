import { createTransport } from "nodemailer";
import {
	passwordResetTemplate,
	purchaseTemplate,
	shopApprovedTemplate,
	shopRejectedTemplate,
} from "./convertToHtml";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

export default function sendMail(
	to: string,
	subject: string,
	payload: object | any
) {
	const { firstname, reason, secretKey, link, status, totalCost } = payload;
	let html;

	switch (subject) {
		case "Shop Approved":
			html = shopApprovedTemplate({ firstname, secretKey, link });
			break;
		case "Shop Rejected":
			html = shopRejectedTemplate({ firstname, reason });
		case "Password Reset":
			html = passwordResetTemplate({ firstname, link });
		case "Purchase Of Goods":
			html = purchaseTemplate({ firstname, status, totalCost });
		default:
			html = "";
			break;
	}
	try {
		const transporter = createTransport({
			//@ts-ignore
			service: "gmail",
			auth: {
				type: "Login",
				user: process.env.EMAIL_USER,
				pass: process.env.APP_PASS,
				// clientId: process.env.OAUTH_CLIENT_ID,
				// clientSecret: process.env.OAUTH_CLIENT_SECRET,
				// refreshToken: process.env.OAUTH_REFRESH_TOKEN,
			},
		});

		const dataObj = { from: "workspace@kiama.com", to, subject, html };

		const mail = transporter.sendMail(dataObj);
		return mail;
	} catch (e) {
		//@ts-ignore
		throw new Error(e);
	}
}
