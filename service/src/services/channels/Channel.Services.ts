import { Schema } from "mongoose";
import Users from "../../model/users/UsersAuth.Model";

class ChannelServices {
	constructor() {}

	async isAdmin(adminId: Schema.Types.ObjectId): Promise<Boolean> {
		let success = false;
		if (adminId) {
			const admin = await Users.findById(adminId).select(["_id"]);
			try {
				if (admin) {
					success = true;
				}
			} catch (e) {
				success = false;
			}
		}
		return success;
	}
}

export default new ChannelServices();
