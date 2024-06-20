import { Strategy, TokenSet, Issuer, generators, Client } from "openid-client";
import { buildJWT } from "../service";

const MICROSOFT_OAUTH_BASE_URL =
  "https://login.microsoftonline.com/common/v2.0";
const OPENID_METADATA_DOCUMENT_ENDPOINT = "/.well-known/openid-configuration";

export const getMicrosoftIssuer = async (): Promise<Issuer> => {
  const microsoftIssuer = await Issuer.discover(
    MICROSOFT_OAUTH_BASE_URL + OPENID_METADATA_DOCUMENT_ENDPOINT,
  );
  console.log(
    "Discovered issuer %s %O",
    microsoftIssuer.issuer,
    microsoftIssuer.metadata,
  );
  return microsoftIssuer;
};

export const getMicrosoftOidcStrategy = (
  microsoftIssuer: Issuer,
): Strategy<Client> => {
  console.log("redirect uri domain:");
  console.log(process.env.API_URL_EXT);

  const client_id = process.env.MICROSOFT_CLIENT_ID!;
  if (typeof client_id !== 'string') {
    throw new Error('No MICROSOFT_CLIENT_ID in the environment');
  }

  const microsoftClient = new microsoftIssuer.Client({
    client_id: client_id,
    client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
    redirect_uris: [`${process.env.API_URL_EXT}/auth/microsoft/callback`],
    post_logout_redirect_uris: [`${process.env.API_URL_EXT}/logout`],
    response_types: ["id_token"],
  });

  // should nonce be generated here, or in middleware functions?
  const nonce = generators.nonce();
  console.log(`Generated a nonce: ${nonce}`);
  // TODO: store nonce (encrypted and httpOnly) in session

  console.log("Built Microsoft client:");
  console.log(microsoftClient.metadata);

  // oidc = Open ID Connect
  return new Strategy({
      client: microsoftClient,
      params: {
        scope: "openid email profile",
        response_mode: "form_post", // could also be 'query' or 'fragment'
        nonce,
      },
      passReqToCallback: true,
      // usePKCE: false, // whether to use PKCE - defaults to true, according to docs
    },
    async (req: any, tokenSet: TokenSet, done: any): Promise<void> => {
      console.log("INVOKING STRATEGY CALLBACK!")
      
      console.log("TOKEN SET:");
      console.log(tokenSet);
      
      console.log("ID TOKEN:")
      console.log(tokenSet.id_token)
      
      console.log("CLAIMS:")
      console.log(tokenSet.claims())

      const id_token = tokenSet.id_token;
      const state = tokenSet.state;
      // TODO: do something with state??

      const claims = tokenSet.claims();
      const email = claims.email
      const returned_nonce = claims.nonce
      // TODO: compare nonces

      if (!email) throw Error("Unable to authenticate without email");

      const jwt = await buildJWT(email);

      if (!jwt) {
        return done({
          status: 404,
          message: `User (${email}) not found. Do you need to log in to a different Microsoft Account?`,
        } as any);
      }

      return done(null, { jwt });

      // TODO: handle error case i.e. done(err)
    },
  );
};
