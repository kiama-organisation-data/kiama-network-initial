import { IRole } from '../model/Role.Model';
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import Users, { IUser } from "../model/users/UsersAuth.Model";

export interface IPayload {
  _id: string;
  iat: number;
  exp: number;
}

class ValidationToken {
  constructor() { }
  TokenValidation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.cookies['Authorization'] || (req.header('Authorization') as string);
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
        process.env.JWT_SECRET || "defaultToken",
        {
          algorithms: ["HS512", "HS256"],
        }
      ) as IPayload;

      const user = await Users.findById(payload._id).select([
        "-password",
        "-personalRate",
      ]);

      req.user = payload._id;
      // @ts-ignore
      req.details = user;

      next();
    } catch (e) {
      res.status(400).send("Invalid Token");
    }
  };

  // Grant access to specific roles and allow them to access the route if they have the role or have the ability
  GrantAccess = (req: Request, res: Response, next: NextFunction) => {
    // get the role from payload._id
    const userId = req.user;
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

  // grant if user isAdmin = true
  accessAdmin = (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user;
    Users.findById(userId, (err: any, user: IUser) => {
      if (err) {
        res.status(400).send("Invalid Token");
      } else {
        if (user.isAdmin) {
          next();
        } else {
          res.status(403).send("Access Denied");
        }
      }
    });
  }

  // auth guard for admin
  authAdmin = (roleReq: any, abilityReq?: Array<object>) => {
    return async function (req: Request, res: Response, next: NextFunction) {
      let user = req.user;
      if (!user) {
        return res.status(500).send('Access not allowed aaaa!');
      }

      let userRole: any = await Users.findById(user).select([
        "role",
        "isAdmin",
        "personalAbility",
      ]).populate('role');

      const userRoleName = userRole.role.name;
      const roleAbility = userRole.role.ability
      const userAbility = userRole.personalAbility;

      const verifGe = roleAbility.some((item: any) => {
        // @ts-ignore
        return abilityReq.some((item2: any) => {
          return item.action === item2.action && item.subject === item2.subject
        })
      })

      const verifPersonal = userAbility.some((item: any) => {
        // @ts-ignore
        return abilityReq.some((item2: any) => {
          return item.action === item2.action && item.subject === item2.subject
        })
      })

      if (roleReq && abilityReq) {
        if (userRole.personalAbility.length > 0) {
          if (userRoleName === roleReq && (verifGe || verifPersonal)) {
            next();
          } else {
            return res.status(403).send('Access not allowed');
          }
        } else {
          if (
            userRoleName === roleReq && verifGe
          ) {
            next();
          } else {
            res.status(403).send("Access Denied");
          }
        }
      } else {
        if (
          userRoleName === roleReq
        ) {
          next();
        } else {
          return res.status(500).send('Access not allowed eeee!');
        }
      }
    }
  }
}

const validationToken = new ValidationToken();
export default validationToken;
