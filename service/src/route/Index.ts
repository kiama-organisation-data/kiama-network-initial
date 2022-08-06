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
import ChallengesRouter from "./Challenges.Router";
import EventsRouter from "./Events.Router";
import CollaboratorsRouter from "./Collaborators.Router";
import CommentsRouter from "./Comments.Router";
import CountriesRouter from "./Countries.Router";
import FavoritesRouter from "./Favorites.Router";
import FriendReqsRouter from "./FriendReqs.Router";
import HistorysRouter from "./Historys.Router";
import NotificationsRouter from "./Notifications.Router";
import LanguagesRouter from "./Languages.Router";
import MedalsRouter from "./Medals.Router";
import NewsRouter from "./News.Router";
import OrientationsRouter from "./Orientations.Router";
import ProfilesRouter from "./Profiles.Router";
import ProjectsRouter from "./Projects.Router";
import ReportsRouter from "./Reports.Router";
import SessionsRouter from "./Sessions.Router";
import SettingsRouter from "./Settings.Router";
import StatisticsRouter from "./Statistics.Router";
import TasksRouter from "./Tasks.Router";
import VotesRouter from "./Votes.Router";
import JobRouter from "./Job.Router";

// category
import NewsCatRouter from "./category/News.Router";
import ChallengesCatRouter from "./category/Challenges.Router";
import EventsCatRouter from "./category/Events.Router";

// stats
import UsersStatsRouter from "./stats/Users.Router";

// collections

import shopRouter from "./collections/Shop.Router";
import CentreRouter from "./collections/Centre.Router";

// Passports
import PassportsRouter from "./Passports.Router";
import ChatRoomRouter from "./ChatRoom.Router";

const router: Router = Router();

function rootRouter() {
  router.use("/user", UsersAuthRouter);
  router.use("/role", validationToken.TokenValidation, RoleRouter);
  router.use("/page", validationToken.TokenValidation, PagesRouter);
  router.use("/msg", validationToken.TokenValidation, MessagesRouter);
  router.use("/chat-room", validationToken.TokenValidation, ChatRoomRouter);
  router.use("/pages/post", validationToken.TokenValidation, PostsPagesRouter);
  router.use("/post", validationToken.TokenValidation, PostsRouter);
  router.use("/channel", validationToken.TokenValidation, ChannelsRouter);
  router.use("/bug", validationToken.TokenValidation, BugsRouter);
  router.use("/challenge", validationToken.TokenValidation, ChallengesRouter);
  router.use("/event", validationToken.TokenValidation, EventsRouter);
  router.use(
    "/collaborator",
    validationToken.TokenValidation,
    CollaboratorsRouter
  );
  router.use("/comment", validationToken.TokenValidation, CommentsRouter);
  router.use("/country", validationToken.TokenValidation, CountriesRouter);
  router.use("/favorite", validationToken.TokenValidation, FavoritesRouter);
  router.use("/friendreq", validationToken.TokenValidation, FriendReqsRouter);
  router.use("/history", validationToken.TokenValidation, HistorysRouter);
  router.use(
    "/notification",
    validationToken.TokenValidation,
    NotificationsRouter
  );
  router.use("/language", validationToken.TokenValidation, LanguagesRouter);
  router.use("/medal", validationToken.TokenValidation, MedalsRouter);
  router.use("/news", validationToken.TokenValidation, NewsRouter);
  router.use(
    "/orientation",
    validationToken.TokenValidation,
    OrientationsRouter
  );
  router.use("/profile", validationToken.TokenValidation, ProfilesRouter);
  router.use("/project", validationToken.TokenValidation, ProjectsRouter);
  router.use("/report", validationToken.TokenValidation, ReportsRouter);
  router.use("/session", validationToken.TokenValidation, SessionsRouter);
  router.use("/setting", validationToken.TokenValidation, SettingsRouter);
  router.use("/statistic", validationToken.TokenValidation, StatisticsRouter);
  router.use("/task", validationToken.TokenValidation, TasksRouter);
  router.use("/vote", validationToken.TokenValidation, VotesRouter);
  router.use("/job", validationToken.TokenValidation, JobRouter);

  // collections
  router.use("/collections/shop", validationToken.TokenValidation, shopRouter);
  router.use("/centre", CentreRouter);

  // category
  router.use("/news/cat", validationToken.TokenValidation, NewsCatRouter);
  router.use(
    "/challenge/cat",
    validationToken.TokenValidation,
    ChallengesCatRouter
  );
  router.use("/event/cat", validationToken.TokenValidation, EventsCatRouter);

  // stats
  router.use("/user/stats", validationToken.TokenValidation, UsersStatsRouter);

  // Passports
  router.use("/passport", PassportsRouter);
  return router;
}

export default rootRouter;
