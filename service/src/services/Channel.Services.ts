import { Schema } from "mongoose";
import Users from "../model/UsersAuth.Model";
import * as cron from "node-cron";
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

  weekly_task = cron.schedule(
    "* * * * MON",
    () => {
      console.log("running");
    },
    {
      scheduled: false,
    }
  );
}

export default new ChannelServices();
