import Users, { IUser } from './../model/UsersAuth.Model';
import passport from "passport";
import passeportFacebook from "passport-facebook";
import passeportGoogle from "passport-google-oauth20";
import Profiles, { IProfile } from "../model/Profiles.Model";

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
                    return done(null, user);
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

                    await newUser.save().then(() => {
                        const profile: IProfile = new Profiles({
                            user: newUser._id,
                        });
                        profile.save();
                    });
                    return done(null, newUser);
                }
            }
        );
        passport.use(facebookStrategy);
    }
}

const passportLibs = new passportConfig();
export default passportLibs;