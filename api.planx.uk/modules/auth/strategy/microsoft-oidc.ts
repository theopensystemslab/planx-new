import type {
  Client,
  ClientMetadata,
  IdTokenClaims,
  StrategyVerifyCallbackReq,
} from "openid-client";
import { Strategy } from "openid-client";
import { buildJWT } from "../service.js";

export const MICROSOFT_OPENID_CONFIG_URL =
  "https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration";

export const getMicrosoftClientConfig = (): ClientMetadata => {
  const client_id = process.env.MICROSOFT_CLIENT_ID!;
  if (typeof client_id !== "string") {
    throw new Error("No MICROSOFT_CLIENT_ID in the environment");
  }
  return {
    client_id,
    client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
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
  req: Http.IncomingMessageWithSession,
  tokenSet,
  done,
): Promise<void> => {
  // TODO: use tokenSet.state to pass the redirectTo query param through the auth flow
  const claims: IdTokenClaims = tokenSet.claims();
  const email = claims.email;
  const returned_nonce = claims.nonce;

  if (returned_nonce != req.session?.nonce) {
    return done(new Error("Returned nonce does not match session nonce"));
  }
  if (!email) {
    return done(new Error("Unable to authenticate without email"));
  }

  const jwt = await buildJWT(email);
  if (!jwt) {
    return done({
      status: 404,
      message: `User (${email}) not found. Do you need to log in to a different Microsoft Account?`,
    });
  }

  return done(null, { jwt });
};
