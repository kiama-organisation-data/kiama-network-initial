import { Request, Response, NextFunction } from "express";
import redisConfig from "../libs/redis";
import { apiCrypto } from "../utils/CrytoUtils";

/**
 * TO.DO: make optimised as possible
 * this middleware runs to check for a shop users token and making sure users shop
 * isn't logged in from  a bot or a hacker so as to ensure security
 */

export async function validateShop(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { shopId } = req.params;
  const secretKey = req.header("x-secret-key");

  if (!secretKey) return res.status(400).send("provide secretkey in header");

  const shopToken = await redisConfig.getValueFromRedis(shopId.toString());

  if (!shopToken) return res.status(400).send("refresh token to get access");
  const isToken = await apiCrypto.compareShopToken(shopToken, secretKey);

  if (!isToken) return res.status(403).send("you are not permitted");
  req.headers["x-shop-id"] = shopId;
  //   console.log(req.header("x-shop-id"));
  next();
}
