import { Schema, model, Document } from "mongoose";

export interface IPage extends Document {
  image: object;
  name: string;
  description: string;
  moderators: Array<any>;
  visitors: Array<string>;
  likes: object;
  email: String;
  mobile: String;
  country: string;
  addLikes(userId: number): Function;
}

const pagesSchema = new Schema(
  {
    image: {
      publicId: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
    name: {
      type: String,
      required: [true, "name is required"],
    },
    description: {
      type: String,
      required: true,
    },
    moderators: {
      type: Array,
      required: true,
    },
    visitors: {
      type: Array,
    },
    likes: {
      userId: {
        type: String,
      },
      count: {
        type: Number,
      },
    },
    email: {
      type: String,
      required: true,
    },
    mobile: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const pageModel = model<IPage>("Page", pagesSchema);
export default pageModel;
