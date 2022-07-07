import { Request, Response } from "express";
import postModel, { IPost } from "../model/Posts.Model";
import Users from "../model/UsersAuth.Model";

class PostsController {
  constructor() {}

  // =========================================================================
  // upload posts with a maximum number of 5 files
  // =========================================================================
  /**
   * @key publicId will be set in the future to run with cloudinary
   */
  uploadPost = (req: Request, res: Response) => {
    if (!req.files)
      return res
        .status(401)
        .json({ success: "fail", msg: "pick a file for upload" });

    let title: string = "";
    let filesUrl: Array<string> = [];
    let filesType: Array<string> = [];

    //@ts-expect-error
    req.files.map((i: any) => {
      filesUrl.push(i.path);
      filesType.push(i.mimetype);
    });

    if (req.body.title) title = req.body.title;
    postModel
      .create({
        title,
        userId: req.body,
        fileType: filesType,
        fileUrl: filesUrl,
        publicId: null,
      })
      .then((result) => {
        res.status(201).json({ success: "true", data: result });
      })
      .catch((err) => {
        res.status(401).send(err);
      });
  };

  // =========================================================================
  // delete a single post by id
  // =========================================================================
  /**
   * @conditional - after this, cloudinary delete file will be implemented in the future
   */
  deletePost = (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) return res.status(400).send("cannot delete without post id");
    postModel
      .findByIdAndDelete(id)
      .then((result) => {
        if (result)
          res.status(201).json({ success: "true", msg: "post deleted" });
      })
      .catch((err) => {
        res.status(401).send(err);
      });
  };

  // =========================================================================
  // get a single post
  // =========================================================================
  /**
   * @future - in the future, this fucntion will be changed to use async await
   */
  getPost = (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) return res.status(400).send("cannot delete without post id");
    postModel
      .findById(id)
      .then((result) => {
        if (!result)
          return res
            .status(400)
            .json({ success: "fail", msg: "post no longer exists" });

        res.status(200).json({ success: "true", data: result });
      })
      .catch((err) => {
        res.status(400).send(err);
      });
  };

  // =========================================================================
  // get all the posts that belongs to a single user
  // =========================================================================
  async getUsersPosts(req: Request, res: Response): Promise<any> {
    const { id } = req.params;
    if (!id) return res.status(400).send("cannot fetch posts without id");

    const getAllPosts = async () => getPosts(id, res);
    const returnValue = await getAllPosts();

    if (!returnValue)
      return res
        .status(400)
        .json({ success: "fail", msg: "cannot find user's posts" });

    res.status(200).json({ success: "true", data: returnValue });
  }

  // =========================================================================
  // edit a single post
  // =========================================================================
  async editSinglePost(req: Request, res: Response): Promise<any> {
    const { id } = req.params;
    if (!id) return res.status(400).send("cannot fetch posts without id");

    const usersPost = await postModel.findByIdAndUpdate(id, {
      title: req.body.title,
    });

    if (!usersPost)
      return res
        .status(400)
        .json({ success: "false", msg: "couldn\t update title" });

    res.status(200).json({ success: "true", msg: "edited successfully" });
  }
}

// =========================================================================
// A stand alone function used for fetching all the posts for a single user
// =========================================================================
async function getPosts(id: any, res: any) {
  const user = await Users.findById(id);

  if (!user) return { success: false };

  const posts = await postModel
    .find({ userId: user._id })
    .sort({ updatedAt: "desc" })
    .limit(5);

  if (!posts) return { success: false };
  return posts;
}

const uploadController = new PostsController();

export default uploadController;
