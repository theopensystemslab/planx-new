const { Router } = require("express");
const { authenticate } = require("passport");

const router = Router();

// when login failed, send failed msg
router.get("/login/failed", (_req, res) => {
  res.status(401).json({
    message: "user failed to authenticate.",
    success: false,
  });
});

// When logout, redirect to client
router.get("/logout", (req, res) => {
  req.logout();
  res.redirect(req.query.url || process.env.EDITOR_URL_EXT);
});

// GET /google

//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Google authentication will involve
//   redirecting the user to google.com.  After authorization, Google
//   will redirect the user back to this application at /auth/google/callback

const handleSuccess = (req, res) => {
  if (req.user) {
    res.cookie("jwt", req.user.jwt, {
      maxAge: 1000 * 60 * 10,
      httpOnly: false,
    });
    const url = req.query.url || process.env.EDITOR_URL_EXT;
    res.redirect(decodeURIComponent(`${url}#${req.user.jwt}`));
  } else {
    res.json({
      message: "no user",
      success: true,
    });
  }
};

router.get(
  "/google",
  authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get(
  "/google/callback",
  authenticate("google", { failureRedirect: "/auth/login/failed" }),
  handleSuccess
);

module.exports = router;
