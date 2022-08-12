import mongoose from "mongoose";
import express, { Application, Request, Response } from "express";
import * as dotenv from "dotenv";
import * as path from "path";
import cors from "cors";
import passport from "passport";
import passportLibs from "./libs/passport";
import session from "express-session";
import cookieParser from "cookie-parser";

// security
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";

import compression from "compression";

import rootRouter from "./route/Index";
import redisConfig from "./libs/redis";
class Server {
  public app: Application;

  constructor() {
    this.app = express();
    this.config();
  }

  public config(): void {
    // load env
    dotenv.config({ path: path.resolve(process.cwd(), ".env") });

    // Mongodb variable for connection
    const url: any = process.env.MONGODB_URI;
    const option = {
      // promiseLibrary: Promise,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // useCreateIndex: true
    };
    // set up mongoose
    console.log("Connecting to DB....");
    mongoose
      .connect(url, option)
      .then(() => console.log("Dabatase connected."))
      .catch((err) => console.log("Error connection db.", err));
    // initiaize redis db connection
    // redisConfig.connect();
    // mongoose.set('useFindAndModify', false);
    // config
    this.app.use(express.json({ limit: "25mb" }));
    this.app.use(express.urlencoded({ limit: "25mb", extended: true }));

    this.app.use(
      cors({
        origin: "*",
        optionsSuccessStatus: 200,
      })
    );

    // call security for protection
    this.app.use(helmet());
    this.app.use(mongoSanitize());
    // Todo: add express-rate-limit

    // call compression to compress all responses of middleware
    this.app.use(compression());

    // call session
    this.app.use(
      session({
        secret: process.env.SESSION_SECRET || "defaultSecret",
        resave: false,
        saveUninitialized: false,
        cookie: {
          maxAge: 1000 * 60 * 60 * 24 * 7,
          secure: false,
          httpOnly: true,
        },
      })
    );

    this.app.use(cookieParser());

    // call passport
    this.app.use(passport.initialize()); // call passport libs
    this.app.use(passport.session());

    passportLibs.init();
    passportLibs.facebook();
    passportLibs.google();

    this.app.use(express.static(path.join(__dirname, "public")));
    this.app.use(express.static(path.join(__dirname, "uploads")));
    this.app.use(express.static(path.join(__dirname, "assets")));
  }

  public routes() {
    // DESCRIPTION: route part one
    this.app.use("/kiama-network/api/v1", rootRouter());

    // Routes for upload file

    this.app.use(
      "/uploads",
      express.static(path.resolve(process.cwd(), "uploads"))
    );
  }
}

export default new Server();
