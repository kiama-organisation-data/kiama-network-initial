import { object } from "@hapi/joi";
import { Schema, model, Document } from "mongoose";

export interface IChat extends Document {
  users: Array<Schema.Types.ObjectId>;
  expired: boolean;
  link: String;
  messages: Array<object>;
}

const chatSchema = new Schema({
  users: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  expired: {
    type: Boolean,
    default: false,
  },
  link: {
    type: String,
  },
  messages: [
    {
      userId: Schema.Types.ObjectId,
      text: String,
    },
  ],
});

export default model<IChat>("ChatRoom", chatSchema);
