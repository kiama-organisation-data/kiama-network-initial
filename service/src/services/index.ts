import { Request, Response, NextFunction } from "express";

class AppResponse {
  constructor() {}

  success = (res: Response, data: any) => {
    res.status(200).json({ success: "true", json: data });
  };

  created = (res: Response, data: any) => {
    res.status(201).json({ success: "true", data });
  };

  fail = (res: Response, msg: any) => {
    res.status(400).json({ success: "fail", msg });
  };

  notFound = (res: Response, msg: any) => {
    res.status(404).json({ success: "fail", msg });
  };

  notPermitted = (res: Response, msg: any) => {
    res.status(403).json({ message: "not permitted" });
  };
}

export default new AppResponse();
