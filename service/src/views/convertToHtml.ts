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

/**
 * Compile to templates
 */

const shopApprovedTemplate = compile(mjml(shopApproved).html);
const shopRejectedTemplate = compile(mjml(shopRejected).html);

export { shopApprovedTemplate, shopRejectedTemplate };
