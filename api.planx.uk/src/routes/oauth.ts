import express, { CookieOptions, Response } from "express";
import { Request } from "express-jwt";
import { URL } from "url";
import passport from "passport";

const router = express.Router();

// when login failed, send failed msg
router.get("/login/failed", (_req, _res, next) => {
  next({
    status: 401,
    message: "user failed to authenticate.",
  });
});

// When logout, redirect to client
router.get("/logout", (req, res) => {
  req.logout(() => {});
  res.redirect(process.env.EDITOR_URL_EXT!);
});

// GET /google

//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Google authentication will involve
//   redirecting the user to google.com.  After authorization, Google
//   will redirect the user back to this application at /auth/google/callback

const handleSuccess = (req: Request, res: Response) => {
  if (req.user) {
    const { returnTo = process.env.EDITOR_URL_EXT } = req.session!;

    const domain = (() => {
      if (process.env.NODE_ENV === "production") {
        if (returnTo?.includes("editor.planx.")) {
          // user is logging in to staging from editor.planx.dev
          // or production from editor.planx.uk
          return `.${new URL(returnTo).host}`;
        } else {
          // user is logging in from either a netlify preview build,
          // or from localhost, to staging (or production... temporarily)
          return undefined;
        }
      } else {
        // user is logging in from localhost, to development
        return "localhost";
      }
    })();

    if (domain) {
      // As domain is set, we know that we're either redirecting back to
      // editor.planx.dev/login, editor.planx.uk, or localhost:PORT
      // (if this code is running in development). With the respective
      // domain set in the cookie.
      const cookie: CookieOptions = {
        domain,
        maxAge: new Date(
          new Date().setFullYear(new Date().getFullYear() + 1)
        ).getTime(),
        httpOnly: false,
      };

      if (process.env.NODE_ENV === "production") {
        cookie.secure = true;
        cookie.sameSite = "none";
      }

      res.cookie("jwt", req.user.jwt, cookie);

      res.redirect(returnTo);
    } else {
      // Redirect back to localhost:PORT/login (if this API is in staging or
      // production), or a netlify preview build url. As the login page is on a
      // different domain to whatever this API is running on, we can't set a
      // cookie. To solve this issue we inject the JWT into the return url as
      // a parameter that can be extracted by the frontend code instead.
      const url = new URL(returnTo);
      url.searchParams.set("jwt", req.user.jwt);
      res.redirect(url.href);
    }
  } else {
    res.json({
      message: "no user",
      success: true,
    });
  }
};

router.get("/google", (req, res, next) => {
  req.session!.returnTo = req.get("Referrer");
  return passport.authenticate("google", {
    scope: ["profile", "email"],
  })(req, res, next);
});

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/auth/login/failed" }),
  handleSuccess
);

export default router;
