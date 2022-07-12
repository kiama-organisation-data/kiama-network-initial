import { Request, Response, NextFunction } from "express";

class MessageHelpers {
  constructor() {}

  isId = (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ success: "fail", msg: "please provide an id" });
    } else {
      next();
    }
  };
}

export default new MessageHelpers();
