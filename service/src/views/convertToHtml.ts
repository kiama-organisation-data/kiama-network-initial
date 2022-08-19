import mjml from "mjml";
import { compile } from "handlebars";
import { readFileSync } from "fs";
import { resolve } from "path";

/**
 * Require all mjml files from same directory path
 */

const shopApproved = readFileSync(
	resolve(__dirname, "./shopApproved.mjml")
).toString();

const shopRejected = readFileSync(
	resolve(__dirname, "./shopRejected.mjml")
).toString();

const passwordReset = readFileSync(
	resolve(__dirname, "./passwordReset.mjml")
).toString();

const organizationCreated = readFileSync(
	resolve(__dirname, "./organizationCreated.mjml")
).toString();
/**
 * Compile to templates
 */

const shopApprovedTemplate = compile(mjml(shopApproved).html);
const shopRejectedTemplate = compile(mjml(shopRejected).html);
const passwordResetTemplate = compile(mjml(passwordReset).html);
const organizationCreatedTemplate = compile(mjml(organizationCreated).html);

export {
	shopApprovedTemplate,
	shopRejectedTemplate,
	passwordResetTemplate,
	organizationCreatedTemplate,
};
