import { Schema, model, Document } from "mongoose";

export interface IChanComm extends Document {
  author: string;
  comment: string;
  parentId: Schema.Types.ObjectId;
  postId: Schema.Types.ObjectId;
  replies: Schema.Types.ObjectId;
  totalReplies: number;
  reaction: Array<any>;
  reactionCount: number;
}

const commetSchema = new Schema(
  {
    author: {
      type: String,
      required: true,
      ref: "User",
    },

    comment: {
      type: String,
      required: true,
    },

    parentId: {
      type: Schema.Types.ObjectId,
      ref: "CommentChannel",
      default: null,
    },

    postId: {
      type: Schema.Types.ObjectId,
      ref: "ChannelPost",
      default: null,
    },

    replies: [{ type: Schema.Types.ObjectId, ref: "CommentChannel" }],

    totalReplies: {
      type: Number,
      default: 0,
    },

    reaction: [{ reactor: Schema.Types.ObjectId, reaction: String }],
    //enum: ["laugh", "clap", "love", "wow"],

    reactionCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

export const channelCommentModel = model<IChanComm>(
  "CommentChannel",
  commetSchema
);
