import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import Users, { IUser } from "../model/UsersAuth.Model";

export interface IPayload {
  _id: string;
  iat: number;
  exp: number;
}

class ValidationToken {
  constructor() {}
  TokenValidation = (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.header("Authorization");
      const bearer: any = token?.split(" ");
      let bearerToken: any = [];
      if (bearer.length != 2) {
        bearerToken = bearer[0];
      } else {
        bearerToken = bearer[1];
      }
      if (!bearerToken) return res.status(401).json("Access Denied");
      const payload = jwt.verify(
        bearerToken,
        process.env["SECRET_TOKEN"] || "defaultToken"
      ) as IPayload;
      req.body = payload._id;

      next();
    } catch (e) {
      res.status(400).send("Invalid Token");
    }
  };

  // Grant access to specific roles and allow them to access the route if they have the role or have the ability
  GrantAccess = (req: Request, res: Response, next: NextFunction) => {
    // get the role from payload._id
    const userId = req.body;
    console.log("azaz", userId);

    // get user role and ability by userId
    Users.findById(userId, (err: any, user: IUser) => {
      if (err) {
        res.status(400).send("Invalid Token");
      } else {
        // if user role is admin, allow access to the route
        if (user.role === "superadmin") {
          next();
        } else {
          // if user role is not admin, check if user has the ability to access the route
          if (user.personalAbility.includes(req.originalUrl)) {
            next();
          } else {
            res.status(403).send("Access Denied");
          }
        }
      }
    });
  };
}

const validationToken = new ValidationToken();
export default validationToken;
