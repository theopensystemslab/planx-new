import passport from "passport";
import { sign } from "jsonwebtoken";
import {
  Strategy as GoogleStrategy,
  Profile,
  VerifyCallback,
} from "passport-google-oauth20";
import { adminGraphQLClient as client } from "../hasura";

const buildJWT = async (profile: Profile, done: VerifyCallback) => {
  const { email } = profile._json;

  const { users } = await client.request(
    `
    query ($email: String!) {
      users(where: {email: {_eq: $email}}, limit: 1) {
        id
      }
    }`,
    { email }
  );

  if (users.length === 1) {
    const { id, is_admin = true } = users[0];

    const hasura = {
      "x-hasura-allowed-roles": ["editor"],
      "x-hasura-default-role": "editor",
      "x-hasura-user-id": id.toString(),
    };

    if (is_admin) {
      hasura["x-hasura-allowed-roles"] = ["admin"];
      hasura["x-hasura-default-role"] = "admin";
    }

    const data = {
      sub: id.toString(),
      // admin: is_admin,
      "https://hasura.io/jwt/claims": hasura,
    };

    done(null, {
      jwt: sign(data, process.env.JWT_SECRET!),
    });
  } else {
    done({
      status: 404,
      message: `User (${email}) not found. Do you need to log in to a different Google Account?`,
    } as any);
  }
};

passport.use(
  "google",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: `${process.env.API_URL_EXT}/auth/google/callback`,
    },
    async function (_accessToken, _refreshToken, profile, done) {
      await buildJWT(profile, done);
    }
  )
);

passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (obj: Express.User, cb) {
  cb(null, obj);
});

export default passport;
