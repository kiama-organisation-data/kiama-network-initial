import { Router } from "express";
import validationToken from "../libs/verifyToken";
import ChannelsRouter from "./Channels.Router";
import MessagesRouter from "./Messages.Router";
import PagesRouter from "./Pages.Router";
import PostsPagesRouter from "./Posts.Pages.Router";
import PostsRouter from "./Posts.Router";
import RoleRouter from "./Role.Router";
import UsersAuthRouter from "./UsersAuth.Router";
import BugsRouter from "./BugsReport.Router";

const router: Router = Router();

function rootRouter() {
  router.use("/user", UsersAuthRouter);
  router.use("/role", validationToken.TokenValidation, RoleRouter);
  router.use("/page", validationToken.TokenValidation, PagesRouter);
  router.use("/msg", validationToken.TokenValidation, MessagesRouter);
  router.use("/pages/post", validationToken.TokenValidation, PostsPagesRouter);
  router.use("/post", validationToken.TokenValidation, PostsRouter);
  router.use("/channel", validationToken.TokenValidation, ChannelsRouter);
  router.use("/bug", validationToken.TokenValidation, BugsRouter);

  return router;
}

export default rootRouter;
