import type { CookieOptions, RequestHandler, Response } from "express";
import type { Request } from "express-jwt";
import {
  createTokenDigest,
  isTokenRevoked,
  revokeToken,
} from "./service/logout/revokeToken.js";
import { getToken, userContext } from "./middleware.js";
import { ServerError } from "../../errors/serverError.js";

export const failedLogin: RequestHandler = (_req, _res, next) =>
  next({
    status: 401,
    message: "User failed to authenticate",
  });

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
    // pizzas rely on staging API for auth (due to static redirect URIs), so we have to allow cross-site
    sameSite: "none",
    secure: true,
  };

  const httpOnlyCookieOptions: CookieOptions = {
    ...defaultCookieOptions,
    httpOnly: true,
  };

  // Set secure, httpOnly cookie with JWT
  res.cookie("jwt", req.user!.jwt, httpOnlyCookieOptions);

  // Set second cookie which can be read by browser to detect presence of the unreadable httpOnly cookie
  const authCookie = btoa(JSON.stringify({ loggedIn: true }));
  res.cookie("auth", authCookie, defaultCookieOptions);

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

/**
 * Revokes a user's JWT on logout
 * TODO: We check if a JWT is revoked when authenticating requests via the API and Hasura
 */
export const logout: RequestHandler = async (_req, res, next) => {
  const { jwt, sub: userId } = userContext.getStore()?.user || {};

  if (!jwt) {
    return next(
      new ServerError({
        message: `JWT missing from logout request, no token to revoke for user ${userId}`,
      }),
    );
  }

  try {
    await revokeToken(jwt);
    return res.status(200).send();
  } catch (error) {
    return next(
      new ServerError({
        message: `Failed to logout successfully. Error: ${error}`,
      }),
    );
  }
};

export const isJWTRevoked: RequestHandler = async (req, res) => {
  const jwt = getToken(req);
  const tokenDigest = createTokenDigest(jwt);
  const isRevoked = await isTokenRevoked(tokenDigest);

  return isRevoked ? res.status(401).send() : res.status(200).send();
};
