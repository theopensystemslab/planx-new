import crypto from "crypto";
import type {
  Client,
  ClientMetadata,
  IdTokenClaims,
  StrategyVerifyCallbackReq,
} from "openid-client";
import { Strategy } from "openid-client";

import { buildUserJWT } from "../service/jwt.js";

export const MICROSOFT_OPENID_CONFIG_URL =
  "https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration";

export const getMicrosoftClientConfig = (): ClientMetadata => {
  const client_id = process.env.MICROSOFT_CLIENT_ID!;
  if (typeof client_id !== "string") {
    throw new Error("No MICROSOFT_CLIENT_ID in the environment");
  }
  // no client_secret needed: we use the id_token + form_post flow, so Microsoft posts a
  // signed id_token straight to our callback, and we never call the token endpoint
  return {
    client_id,
    redirect_uris: [`${process.env.API_URL_EXT}/auth/microsoft/callback`],
    post_logout_redirect_uris: [process.env.EDITOR_URL_EXT!],
    response_types: ["id_token"],
  };
};

// oidc = OpenID Connect, an auth standard built on top of OAuth 2.0
export const getMicrosoftOidcStrategy = (client: Client): Strategy<Client> => {
  return new Strategy(
    {
      client: client,
      params: {
        scope: "openid email profile",
        response_mode: "form_post",
      },
      // need the request in the verify callback to validate the returned nonce
      passReqToCallback: true,
    },
    verifyCallback,
  );
};

const verifyCallback: StrategyVerifyCallbackReq<Express.User> = async (
  req: Http.IncomingMessageWithCookies,
  tokenSet,
  done,
): Promise<void> => {
  // id_token signature is already validated against the issuer's JWKS by openid-client
  const claims: IdTokenClaims = tokenSet.claims();

  // ensure the response is authentic by comparing nonce
  const returned_nonce = claims.nonce;
  if (!req.cookies || !req.cookies["ms-oidc-nonce"]) {
    return done(new Error("No nonce found in appropriate cookie"));
  }
  const original_nonce = req.cookies["ms-oidc-nonce"];
  const hash = crypto.createHash("sha256").update(original_nonce).digest("hex");
  if (returned_nonce != hash) {
    return done(
      new Error(
        "Returned nonce does not match nonce sent with original request",
      ),
    );
  }

  // done() isn't typed to accept an info object, but passport passes it through to our callback handler
  const fail = done as unknown as (
    err: null,
    user: false,
    info: { reason: "missing-email" | "user-not-found"; email?: string },
  ) => void;

  // Entra only includes the email claim if the account has a (verified) email address,
  // so e.g. a work account with no email set will be unable to use Microsoft SSO until one is added
  const email = claims.email;
  if (!email) {
    return fail(null, false, { reason: "missing-email" });
  }

  const jwt = await buildUserJWT(email);
  if (!jwt) {
    return fail(null, false, { reason: "user-not-found", email });
  }

  return done(null, { jwt });
};
