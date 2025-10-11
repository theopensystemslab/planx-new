import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { buildUserJWT } from "../service/jwt.js";

const GOOGLE_AUTH_BLOCKLIST = ["newcastle.gov.uk"];

export const googleStrategy = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: `${process.env.API_URL_EXT}/auth/google/callback`,
  },
  async function (_accessToken, _refreshToken, profile, done) {
    const { email } = profile._json;
    if (!email) throw Error("Unable to authenticate without email");

    const isBlocked = checkBlocklist(email);

    if (isBlocked) {
      return done({
        status: 404,
        message:
          "Domain is blocked from using Google authentication. Please try another method, such as Microsoft single sign-on.",
      } as any);
    }

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

/**
 * Council IT teams may decide to disallow sign-on via Google
 * Check if domain is permitted to use this auth method
 * XXX: In future, a more robust method may be appropriate if more teams require this (e.g. a value in team_settings)
 */
const checkBlocklist = (email: string): boolean => {
  const domain = email.toLowerCase().split("@")[1];
  const isBlocked = GOOGLE_AUTH_BLOCKLIST.includes(domain);

  return isBlocked;
};
