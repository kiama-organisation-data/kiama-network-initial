import multer, { FileFilterCallback } from "multer";
import { Request } from "express";
import uuid from "./randomGen";
import path from "path";

//types declaration for multer
type DestinationCallback = (error: Error | null, destination: string) => void;
type FileNameCallback = (error: Error | null, filename: string) => void;

class MulterOptions {
  constructor() {}

  fileStorage = multer.diskStorage({
    destination: (
      request: Request,
      file: Express.Multer.File,
      callback: DestinationCallback
    ): void => {
      let dir: string;
      const audio = ["audio/mpeg", "audio/mp3", "audio/m4a"];
      const image = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/pdf",
        "image/gif",
      ];
      const video = [
        "video/mp4",
        "video/wma",
        "video/wmv",
        "video/mpg",
        "video/mpeg",
      ];
      if (audio.includes(file.mimetype)) {
        dir = path.resolve(process.cwd(), "assets", "audio");
        callback(null, dir);
      } else if (video.includes(file.mimetype)) {
        dir = path.resolve(process.cwd(), "assets", "videos");

        callback(null, dir);
      } else if (image.includes(file.mimetype)) {
        dir = path.resolve(process.cwd(), "assets", "images");

        callback(null, dir);
      } else {
        throw new Error("File not permitted");
      }
      // setting destination
      // will be removed and left blank when production ready
    },

    filename: (
      req: Request,
      file: Express.Multer.File,
      callback: FileNameCallback
    ): void => {
      // .Naming of file
      callback(null, `file-${uuid()}-${file.originalname}`);
    },
  });

  fileFilter = (
    request: Request,
    file: Express.Multer.File,
    callback: FileFilterCallback
  ): void => {
    if (
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpg" ||
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/pdf" ||
      file.mimetype === "image/gif" ||
      file.mimetype === "audio/mp3" ||
      file.mimetype === "audio/mpv" ||
      file.mimetype === "audio/m4a" ||
      file.mimetype === "audio/mpeg" ||
      file.mimetype === "video/wma" ||
      file.mimetype === "video/mpg" ||
      file.mimetype === "video/mpeg" ||
      file.mimetype === "video/mp4" ||
      file.mimetype === "video/wmv"
    ) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  };
}

const multerOptions = new MulterOptions();

export const messageUploads = multer({
  storage: multerOptions.fileStorage,

  fileFilter: multerOptions.fileFilter,
}).single("upload");

export const postsUploads = multer({
  storage: multerOptions.fileStorage,

  fileFilter: multerOptions.fileFilter,
}).array("upload", 5);

export default multerOptions;
