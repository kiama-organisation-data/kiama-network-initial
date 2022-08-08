import { createTransport } from "nodemailer";
import {
  shopApprovedTemplate,
  shopRejectedTemplate,
} from "../../views/convertToHtml";

function sendMail(to: string, subject: string, payload: object | any) {
  const { firstname, reason, secretKey, link } = payload;
  let html;

  switch (subject) {
    case "Shop Approved":
      html = shopApprovedTemplate({ firstname, secretKey, link });
      break;
    case "Shop Rejected":
      html = shopRejectedTemplate({ firstname, reason });
    default:
      html = "";
      break;
  }
  try {
    const transporter = createTransport({
      //@ts-ignore
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
        clientId: process.env.OAUTH_CLIENT_ID,
        clientSecret: process.env.OAUTH_CLIENT_SECRET,
        refreshToken: process.env.OAUTH_REFRESH_TOKEN,
      },
    });

    const dataObj = { from: "Kiama Network", to, subject, html };

    const mail = transporter.sendMail(dataObj);
    return mail;
  } catch (e: any) {
    throw new Error(e);
  }
}
