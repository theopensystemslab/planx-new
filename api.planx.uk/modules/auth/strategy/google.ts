import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { buildUserJWT } from "../service/jwt.js";

export const googleStrategy = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: `${process.env.API_URL_EXT}/auth/google/callback`,
  },
  async function (_accessToken, _refreshToken, profile, done) {
    const { email } = profile._json;
    if (!email) throw Error("Unable to authenticate without email");

    const jwt = await buildUserJWT(email);

    if (!jwt) {
      return done({
        status: 404,
        message: `User (${email}) not found. Do you need to log in to a different Google Account?`,
      } as any);
    }

    done(null, { jwt });
  },
);
