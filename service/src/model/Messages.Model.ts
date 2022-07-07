import mongoose, { Schema, model } from "mongoose";

export interface IPrmsg extends mongoose.Document {
  message: object;
  reply: string;
  users: Array<any>;
  sender: Schema.Types.ObjectId;
}

export interface IGrmsg extends mongoose.Document {
  message: object;
  reply: string;
  users: object;
  sender: Schema.Types.ObjectId;
}

/**
 * @param privateMsgSchema is on a test and might differ in the future
 * @param groupMsgSchema is on a test and might differ in the future
 */

const privateMsgSchema = new Schema(
  {
    message: {
      text: {
        type: String,
        required: true,
        min: 1,
      },
      reply: {
        type: String,
        min: 1,
      },
    },
    users: {
      from: {
        type: Schema.Types.ObjectId,
        required: true,
      },
      to: {
        type: Array,
        required: true,
      },
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const groupMsgSchema = new Schema(
  {
    message: {
      text: {
        type: String,
        required: true,
        min: 1,
      },
      reply: {
        type: String,
        min: 1,
      },
    },
    users: Array,
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const privateMsgModel = model<IPrmsg>("privateMsg", privateMsgSchema);
const groupMsgModel = model<IGrmsg>("groupMsg", groupMsgSchema);

module.exports = {
  privateMsgModel,
  groupMsgModel,
};
