import { IUrls } from "../controller/Posts.Controller";
import { uploadToCloud } from "../libs/cloudinary";

class MidFuncs {
	constructor() {}

	/**
	 * @method WalletFunctions checks number of users with a wallet and creates a serial key
	 * @return serialKey is a string of unique yet chronologically created string
	 */
	public WalletFunctions(count: number): string {
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
		return serialKey;
	}

	/**
	 *
	 * @param files contains a max of five arrays
	 * @param body contains a texts array of text
	 * @returns text and urls are arrays of texts and cloudinary object
	 * @method PostLoop works as a function to loop through all file paths and texts
	 */

	public PostLoop = async (files: any, body: any) => {
		let texts: Array<string> = [];
		let paths: Array<string> = [];

		if (files) {
			//@ts-ignore
			files.map((file: any) => {
				paths.push(file.path);
			});
		}

		if (body.texts) {
			body.texts.map((text: string) => {
				texts.push(text);
			});
		}

		let urls: Array<IUrls> = [];

		while (paths.length > 0) {
			const path = paths.pop();

			if (path) {
				const { secure_url, public_id } = await uploadToCloud(path);

				urls.push({
					publicId: public_id,
					url: secure_url,
				});
			}
		}

		return { texts, urls };
	};
}

export default new MidFuncs();
