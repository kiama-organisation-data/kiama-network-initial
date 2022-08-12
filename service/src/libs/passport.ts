import Users, { IUser } from '../model/users/UsersAuth.Model';
import passport from "passport";
import passeportFacebook from "passport-facebook";
import passeportGoogle from "passport-google-oauth20";
import Profiles, { IProfile } from "../model/users/Profiles.Model";
import AuthService from "../services/users/Auth.Services";
import userServices from "../services/users/User.Services";

import * as dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });


class passportConfig {
    constructor() { }

    public init(): void {
        passport.serializeUser((user, done) => {
            done(null, user);
        }
        );
        passport.deserializeUser((user: any, done) => {
            done(null, user);
        });
    }

    public facebook(): void {
        // @ts-ignore
        const facebookStrategy = new passeportFacebook.Strategy({
            clientID: process.env.FACEBOOK_CLIENT_ID,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
            callbackURL: process.env.FACEBOOK_CALLBACK_URL,
            profileFields: ["id", "email", "name", "picture.type(large)"],
            scope: ["email", "public_profile"],
            enableProof: true
        },
            // @ts-ignore
            async (accessToken, refreshToken, profile, done) => {
                const user = await Users.findOne({ email: profile.emails[0].value });
                if (user) {
                    const token = AuthService.generateJWT(user._id);
                    const cookie = AuthService.createCookie(token);
                    return done(null, { user: user, token, cookie });
                } else {
                    const newUser = new Users({
                        email: profile.emails[0].value,
                        'name.first': profile.name.givenName,
                        'name.last': profile.name.familyName,
                        username: profile.name.givenName,
                        password: 'none',
                        avatar: profile.photos[0].value,
                        provider: 'facebook',
                        providerId: profile.id,
                        providerToken: accessToken,
                    });

                    let usernameFinal = userServices.proposeUsername(newUser.username);
                    usernameFinal
                        .then((username) => {
                            newUser.username = username;
                        })
                        .then(() => {
                            newUser.save().then(() => {
                                const profile: IProfile = new Profiles({
                                    user: newUser._id,
                                });
                                profile.save();

                                // generate token with user id
                                const token = AuthService.generateJWT(newUser._id);
                                const cookie = AuthService.createCookie(token);
                                return done(null, { user: newUser, token, cookie });
                            });
                        })
                }
            }
        );
        passport.use(facebookStrategy);
    }

    public google(): void {
        // @ts-ignore
        const googleStrategy = new passeportGoogle.Strategy({
            // @ts-ignore
            clientID: process.env.GOOGLE_CLIENT_ID,
            // @ts-ignore
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
            scope: ["email", "profile"],
            enableProof: true
        },
            // @ts-ignore
            async (accessToken, refreshToken, profile, done) => {
                const user = await Users.findOne({ email: profile.emails[0].value });
                if (user) {
                    const token = AuthService.generateJWT(user._id);
                    const cookie = AuthService.createCookie(token);
                    return done(null, { user: user, token, cookie });
                } else {
                    const newUser = new Users({
                        email: profile.emails[0].value,
                        'name.first': profile.name.givenName,
                        'name.last': profile.name.familyName,
                        username: profile.name.givenName,
                        password: 'none',
                        avatar: profile.photos[0].value,
                        provider: 'google',
                        providerId: profile.id,
                        providerToken: accessToken,
                    });
                    let usernameFinal = userServices.proposeUsername(newUser.username);
                    usernameFinal
                        .then((username) => {
                            newUser.username = username;
                        })
                        .then(() => {
                            newUser.save().then(() => {
                                const profile: IProfile = new Profiles({
                                    user: newUser._id,
                                });
                                profile.save();

                                // generate token with user id
                                const token = AuthService.generateJWT(newUser._id);
                                const cookie = AuthService.createCookie(token);
                                return done(null, { user: newUser, token, cookie });
                            });
                        })
                }
            }
        );
        passport.use(googleStrategy);
    }
}

const passportLibs = new passportConfig();
export default passportLibs;