import mjml from "mjml";
import { compile } from "handlebars";
import { readFileSync } from "fs";
import { resolve } from "path";

/**
 * Require all mjml files from views directory path
 */

const shopApproved = readFileSync(
	resolve(__dirname, "../../../views/shopApproved.mjml")
).toString();

const shopRejected = readFileSync(
	resolve(__dirname, "../../../views/shopRejected.mjml")
).toString();

const passwordReset = readFileSync(
	resolve(__dirname, "../../../views/passwordReset.mjml")
).toString();

const organizationCreated = readFileSync(
	resolve(__dirname, "../../../views/organizationCreated.mjml")
).toString();

const purchase = readFileSync(
	resolve(__dirname, "../../../views/purchase.mjml")
).toString();
/**
 * Compile to templates
 */

const shopApprovedTemplate = compile(mjml(shopApproved).html);
const shopRejectedTemplate = compile(mjml(shopRejected).html);
const passwordResetTemplate = compile(mjml(passwordReset).html);
const organizationCreatedTemplate = compile(mjml(organizationCreated).html);
const purchaseTemplate = compile(mjml(purchase).html);

export {
	shopApprovedTemplate,
	shopRejectedTemplate,
	passwordResetTemplate,
	organizationCreatedTemplate,
	purchaseTemplate,
};
