import { string } from "@hapi/joi";
import { Schema, model, Document } from "mongoose";
import { apiCrypto } from "../utils/CrytoUtils";

//interface and model will be updated in the future to support payment
export interface IChannel extends Document {
  name: string;
  description: string;
  coverImage: object;
  admins: Array<object>;
  stars: number;
  followers: Array<object>;
  size: number;
  email: string;
  category: string;
  publicKey: string;
  privateKey: string;
  secretKey: string;
}

const channelSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    coverImage: {
      publicId: String,
      url: String,
    },
    admins: {
      type: Array,
      required: true,
    },
    followers: {
      type: Array,
    },
    category: {
      type: String,
      default: "tech",
      enum: ["tech", "entertainment", "news", "nature", "politics"],
    },
    stars: Number,
    size: Number,
    email: String,
    publicKey: String,
    privateKey: String,
    secretKey: String,
  },
  { _id: true, timestamps: true, toJSON: { virtuals: true } }
);

export const createApiKeys = async function (param: any): Promise<object> {
  const username = param[0].username;
  const publicKey = await apiCrypto.hashParam(username);
  const userId = param[0].userId;
  const privateKey = await apiCrypto.hashParamJwt(username, userId);
  const secretKey = publicKey.concat(privateKey);
  const data = { publicKey, privateKey, secretKey };
  return data;
};

export const channelModel = model<IChannel>("Channel", channelSchema);
