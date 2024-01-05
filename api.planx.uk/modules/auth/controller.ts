import { CookieOptions, RequestHandler, Response } from "express";
import { Request } from "express-jwt";

export const failedLogin: RequestHandler = (_req, _res, next) =>
  next({
    status: 401,
    message: "User failed to authenticate",
  });

export const logout: RequestHandler = (req, res) => {
  req.logout(() => {
    // do nothing
  });
  res.redirect(process.env.EDITOR_URL_EXT!);
};

export const handleSuccess = (req: Request, res: Response) => {
  if (!req.user) {
    return res.json({
      message: "no user",
      success: true,
    });
  }

  // Check referrer of original request
  // This means requests from Pizzas to the staging API will not get flagged as `isStagingOrProd`
  const { returnTo = process.env.EDITOR_URL_EXT } = req.session!;
  if (!returnTo) throw Error("Can't generate returnTo URL from session");

  const isStagingOrProd = returnTo.includes("editor.planx.");

  isStagingOrProd
    ? setJWTCookie(returnTo, res, req)
    : setJWTSearchParams(returnTo, res, req);
};

/**
 * Handle auth for staging and production
 *
 * Use a httpOnly cookie to pass the JWT securely back to the client.
 * The client will then use the JWT to make authenticated requests to the API.
 */
function setJWTCookie(returnTo: string, res: Response, req: Request) {
  const defaultCookieOptions: CookieOptions = {
    domain: `.${new URL(returnTo).host}`,
    maxAge: new Date(
      new Date().setFullYear(new Date().getFullYear() + 1),
    ).getTime(),
    sameSite: "none",
  };

  const httpOnlyCookieOptions: CookieOptions = {
    ...defaultCookieOptions,
    httpOnly: true,
    secure: true,
  };

  // Set secure, httpOnly cookie with JWT
  res.cookie("jwt", req.user!.jwt, httpOnlyCookieOptions);

  // Set second cookie which can be read by browser to detect presence of the unreadable httpOnly cookie
  res.cookie("auth", { loggedIn: true }, defaultCookieOptions);

  res.redirect(returnTo);
}

/**
 * Handle auth for local development and Pizzas
 *
 * We can't use cookies cross-domain.
 * Inject the JWT into the return URL, which can then be set as a cookie by the frontend
 */
function setJWTSearchParams(returnTo: string, res: Response, req: Request) {
  const url = new URL(returnTo);
  url.searchParams.set("jwt", req.user!.jwt);
  res.redirect(url.href);
}
