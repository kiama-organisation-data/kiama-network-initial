import { Request, Response } from "express";
import { channelCommentModel } from "../model/comments/channel.Model";
import channelPostModel from "../model/Posts.Channels";
import AppResponse from "../services/index";

class channelCommentCntrl {
  constructor() {}

  createComment = async (req: Request, res: Response) => {
    //@ts-expect-error
    const { user } = req;
    const { parentId, postId, comment } = req.body;

    let newComment = new channelCommentModel({
      author: user,
      comment,
      postId,
    });

    if (parentId) {
      const parentComment = await channelPostModel.findOne({
        _id: postId,
        comments: parentId,
      });

      if (!parentComment) return AppResponse.notFound(res);

      newComment.parentId = parentId;
      await channelCommentModel.findByIdAndUpdate(
        parentId,
        { $inc: { totalReplies: 1 }, $push: { replies: newComment._id } },
        { new: true }
      );
    }
    newComment = await newComment.save();

    const post = await channelPostModel.findByIdAndUpdate(
      postId,
      { $inc: { commentCount: 1 }, $push: { comments: newComment._id } },
      { new: true }
    );

    if (!post) {
      AppResponse.notFound(res, "post not found");
    } else {
      AppResponse.created(res, newComment);
    }
  };

  getOneComment = async (req: Request, res: Response) => {
    const { commentId } = req.params;
    const comment = await channelCommentModel
      .findById(commentId)
      .populate("author", "username")
      .populate("replies", "author comment parentId")
      .select(["-uniqueKey", "-publicKey", "-creator"])
      .lean();

    if (!comment) return AppResponse.notFound(res);

    try {
      AppResponse.success(res, comment);
    } catch (e) {
      AppResponse.fail(res, e);
    }
  };

  editComment = async (req: Request, res: Response) => {
    const { commentId } = req.params;
    const { comment } = req.body;

    const commentM = await channelCommentModel
      .findByIdAndUpdate(commentId, { comment }, { new: true })
      .lean();

    try {
      AppResponse.success(res, commentM);
    } catch (e) {
      AppResponse.fail(res, e);
    }
  };

  // remeber to add pagination
  getAllCommentsForAPost = async (req: Request, res: Response) => {
    const { postId } = req.params;

    const channel = await channelPostModel.findById(postId).lean().populate({
      path: "comments",
      select:
        "author comment replies updatedAt createdAt _id reactors reactionCount reaction",
    });

    try {
      if (!channel) return AppResponse.notFound(res);

      AppResponse.success(res, channel.comments);
    } catch (e) {
      AppResponse.fail(res, e);
    }
  };

  deleteComment = async (req: Request, res: Response) => {
    const { commentId } = req.params;

    const comment = await channelCommentModel.findById(commentId);

    if (!comment) {
      return AppResponse.notFound(res);
    }

    const { parentId, postId } = comment;

    const post = await channelPostModel.findById(postId);

    //@ts-expect-error
    const { comments, commentCount, creator } = post;

    if (!comments.length && commentCount < 1) {
      return AppResponse.fail(res, "no comments");
      //@ts-expect-error
    } else if (creator.toString() !== req.user) {
      return AppResponse.notPermitted(res, "not permitted");
    }

    if (parentId) {
      await channelCommentModel.findByIdAndUpdate(
        parentId,
        { $pull: { replies: comment._id }, $inc: { totalReplies: -1 } },
        { new: true }
      );
    }

    const updatedPost = await channelPostModel
      .findByIdAndUpdate(
        { _id: comment.postId },
        { $pull: { comments: commentId }, $inc: { commentCount: -1 } },
        { new: true }
      )
      .select(["-uniqueKey", "-publicKey", "-creator"]);

    try {
      await channelCommentModel.deleteOne({ _id: commentId });
      AppResponse.success(res, updatedPost);
    } catch (e) {
      AppResponse.fail(res, e);
    }
  };

  addReaction = async (req: Request, res: Response) => {
    const { reaction } = req.query;
    const { commentId } = req.params;
    //@ts-expect-error
    const reactor = req.user;

    const comment = await channelCommentModel
      .findByIdAndUpdate(
        commentId,
        {
          $push: { reaction: { reactor, reaction } },
          $inc: { reactionCount: 1 },
        },
        { new: true }
      )
      .lean();

    if (!comment) {
      return AppResponse.notFound(res);
    }

    try {
      AppResponse.success(res, comment);
    } catch (e) {
      AppResponse.fail(res, e);
    }
  };

  removeReaction = async (req: Request, res: Response) => {
    const { reaction } = req.query;
    const { commentId } = req.params;
    //@ts-expect-error
    const reactor = req.user;

    const reactionCheck = await channelCommentModel
      .findById(commentId)
      .select(["reaction"]);

    if (!reactionCheck) {
      return AppResponse.notFound(res);
    }

    let procceed = false;

    reactionCheck.reaction.map((i: any) => {
      if (i.reactor.toString() === reactor.toString()) {
        procceed = true;
      }
    });

    if (!procceed) {
      return AppResponse.fail(res, "fail");
    }

    const comment = await channelCommentModel
      .findByIdAndUpdate(
        commentId,
        {
          $pull: { reaction: { reactor, reaction } },
          $inc: { reactionCount: -1 },
        },
        { new: true }
      )
      .lean();

    try {
      AppResponse.success(res, comment);
    } catch (e) {
      AppResponse.fail(res, e);
    }
  };
}

export default new channelCommentCntrl();
