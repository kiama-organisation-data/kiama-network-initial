import mongoose from "mongoose";

const schema: any = mongoose.Schema;

export interface IPost extends mongoose.Document {
  title: string;
  fileUrl: string;
  fileType: string;
  files: Array<any>;
  file: string;
}

const postSchema = new schema(
  {
    title: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
    },
    fileType: {
      type: String,
      required: true,
    },
    files: {
      type: Array,
    },
    file: {
      type: String,
    },
  },
  { _id: true, timeStamps: true }
);

const postModel = mongoose.model<IPost>("Posts", postSchema);
export default postModel;
