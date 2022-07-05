import multer, { FileFilterCallback } from "multer";
import { Request } from "express";
import uuid from "./randomGen";
import path from "path";

// var prefix = Math.floor(Math.random() * 90).toFixed(4);

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
      if (file.fieldname === "audio") {
        dir = path.resolve(process.cwd(), "assets", "audio");
        callback(null, dir);
      }
      if (file.fieldname === "video") {
        dir = path.resolve(process.cwd(), "assets", "videos");

        callback(null, dir);
      }
      if (file.fieldname === "image") {
        dir = path.resolve(process.cwd(), "assets", "images");

        callback(null, dir);
      }
      // setting destination
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

export default multerOptions;
