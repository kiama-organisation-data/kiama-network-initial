import mongoose, { Schema } from "mongoose";
import { Request, Response, NextFunction } from "express";
import AppResponse from "../services/index";

// checkObjectId is a middleware that checks if the id is a valid ObjectId
class checkObjectId {
    // checkObjectId is a middleware that checks if the id is a valid ObjectId
    // @param {id} id is the id of the object to be checked
    constructor() { }


    isValid(res: Response, id: any) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return AppResponse.fail(res, "Invalid id");
        }
        return true;
    }
}
export default new checkObjectId();