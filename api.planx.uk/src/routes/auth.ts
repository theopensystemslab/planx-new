import express from "express";
import { urlencoded } from "body-parser";
import { adminGraphQLClient as client } from "../hasura";
import cookieSession from "cookie-session";
import passport from "../auth/passport";
import { useJWT } from "../auth/jwt";
import oauthRouter from "./oauth";

let router = express.Router();

// needed for storing original URL to redirect to in login flow
router.use(
  cookieSession({
    maxAge: 24 * 60 * 60 * 100,
    name: "session",
    secret: process.env.SESSION_SECRET,
  })
);

router.use(passport.initialize());
router.use(passport.session());
router.use(urlencoded({ extended: true }));

router.use("/auth", oauthRouter);

router.get("/me", useJWT, async function (req, res, next) {
  // useJWT will return 401 if the JWT is missing or malformed
  if (!req.user?.sub)
    next({ status: 401, message: "User ID missing from JWT" });

  try {
    const user = await client.request(
      `query ($id: Int!) {
        users_by_pk(id: $id) {
          id
          first_name
          last_name
          email
          is_admin
          created_at
          updated_at
        }
      }`,
      { id: req.user?.sub }
    );

    if (!user.users_by_pk)
      next({ status: 404, message: `User (${req.user?.sub}) not found` });

    res.json(user.users_by_pk);
  } catch (err) {
    next(err);
  }
});

export default router;
