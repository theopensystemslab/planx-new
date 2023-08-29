import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { buildJWT } from "../service";

export const googleStrategy = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: `${process.env.API_URL_EXT}/auth/google/callback`,
  },
  async function (_accessToken, _refreshToken, profile, done) {
    const { email } = profile._json;
    const jwt = await buildJWT(email);

    if (!jwt) {
      return done({
        status: 404,
        message: `User (${email}) not found.Do you need to log in to a different Google Account?`,
      } as any);
    }

    done(null, { jwt });
  },
);
