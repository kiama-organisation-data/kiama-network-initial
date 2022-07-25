import mongoose, { Schema } from "mongoose";
import { Request, Response } from "express";

// checkObjectId is a middleware that checks if the id is a valid ObjectId
class checkObjectId {
    // checkObjectId is a middleware that checks if the id is a valid ObjectId
    // @param {Object} req - the request object
    // @param {Object} res - the response object
    // @param {Function} next - the next function
    // @return {Function} next - the next function
    constructor() { }
    public static verifyObjectId(req: Request, res: Response, next: any, id: string) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                error: "Invalid ID",
            });
        }
        next();
    }
}
export default checkObjectId;