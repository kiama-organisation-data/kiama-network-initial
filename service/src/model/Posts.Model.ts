import mongoose from "mongoose";

const schema: any = mongoose.Schema;

/**
 * @interface will be updated in the future
 */
export interface IPost extends mongoose.Document {
  title: string;
  fileUrl: Array<string>;
  fileType: Array<string>;
  publicId: string;
  userId: mongoose.Schema.Types.ObjectId;
}

const postSchema = new schema(
  {
    title: {
      type: String,
    },
    publicId: {
      type: String || null,
    },
    fileType: {
      type: Array,
      required: true,
    },
    fileUrl: Array,
    userId: {
      type: schema.Types.ObjectId,
      ref: "User",
    },
  },
  { _id: true, timestamps: true, toJSON: { virtuals: true } }
);

const postModel = mongoose.model<IPost>("Posts", postSchema);
export default postModel;
