import multer from "multer";
import fs from "fs";
import { Request, Response } from 'express'

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads/");
    },
    filename: (req, file, cb) => {
        // remove espace and special character in file name
        let fileName = file.originalname.replace(/\s/g, "");
        cb(null, Date.now() + '-' + fileName);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
        }
    }
});

const fileUpload = upload.single("avatar");

let multerMiddleware = (req: Request, res: Response, next: any) => {
    fileUpload(req, res, (err) => {
        if (err) {
            res.json({ success: false, message: err });
        } else {
            next();
        }
    });
};

export default multerMiddleware;



