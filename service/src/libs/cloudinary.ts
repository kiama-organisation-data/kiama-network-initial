import * as cloudinary from "cloudinary";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });
const cloudinaryConfig = cloudinary.v2;

cloudinaryConfig.config({
	cloud_name: process.env.CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadToCloud(path: string) {
	const { secure_url, public_id } = await cloudinaryConfig.uploader.upload(
		path
	);
	return { secure_url, public_id };
}

export async function deleteFromCloud(publicId: string) {
	try {
		await cloudinaryConfig.uploader.destroy(publicId);
		return true;
	} catch (error) {
		return error;
	}
}
