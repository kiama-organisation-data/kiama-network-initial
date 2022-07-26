import mongoose from "mongoose";

const shema: any = mongoose.Schema;

export interface IComment extends mongoose.Document {
  postId: string;
  bodyText: string;
  bodyPhoto: string;
  bodyVideo: string;
  likedBy: Array<string>;
  commentedBy: Array<string>;
}

const commentsShema = new shema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "post",
      required: true,
    },
    bodyText: { type: String, required: true },
    bodyPhoto: { type: String, required: false, default: null },
    bodyVideo: { type: String, required: false, default: null },
    emoji: [{ type: String, required: false, default: null }],
    likedBy: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
    },
    commentedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  { _id: true, timestamps: true }
);

const Comments = mongoose.model<IComment>("Comment", commentsShema);

export default Comments;
