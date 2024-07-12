import { Strategy, TokenSet, Client } from "openid-client";
import { buildJWT } from "../service";

export const getMicrosoftOidcStrategy = (
  client: Client,
): Strategy<Client> => {
  console.log("redirect uri domain:");
  console.log(process.env.API_URL_EXT);

  // oidc = OpenID Connect
  return new Strategy({
      client: client,
      params: {
        scope: "openid email profile",
        response_mode: "form_post", // could also be 'query' or 'fragment'
      },
      passReqToCallback: true,
      // usePKCE: false, // whether to use PKCE - defaults to true, according to docs
    },
    async (req: any, tokenSet: TokenSet, done: any): Promise<void> => {
      console.log("INVOKING STRATEGY CALLBACK!")
      
      console.log("TOKEN SET:");
      console.log(tokenSet);
      
      console.log("CLAIMS:")
      console.log(tokenSet.claims())

      const id_token = tokenSet.id_token;
      const state = tokenSet.state;
      // TODO: do something with state??

      const claims = tokenSet.claims();
      const email = claims.email
      const returned_nonce = claims.nonce

      console.log("SESSION:")
      console.log(req.session)

      if (returned_nonce != req.session.nonce) {
        return done(new Error("Returned nonce does not match session nonce"), null)
      };

      if (!email) {
        return done (new Error("Unable to authenticate without email"), null)
      };

      const jwt = await buildJWT(email);

      if (!jwt) {
        return done({
          status: 404,
          message: `User (${email}) not found. Do you need to log in to a different Microsoft Account?`,
        } as any, null);
      }

      return done(null, { jwt });

      // TODO: handle error case i.e. done(err)
    },
  );
};
