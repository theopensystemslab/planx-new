import { Issuer } from "openid-client";
import passport, { type Authenticator } from "passport";

import { googleStrategy } from "./strategy/google.js";
import {
  getMicrosoftOidcStrategy,
  getMicrosoftClientConfig,
  MICROSOFT_OPENID_CONFIG_URL,
} from "./strategy/microsoft-oidc.js";

export default async (): Promise<Authenticator> => {
  // explicitly instantiate new passport class for clarity
  const customPassport = new passport.Passport();

  // instantiate Microsoft OIDC client, and use it to build the related strategy
  const microsoftIssuer = await Issuer.discover(MICROSOFT_OPENID_CONFIG_URL);
  console.debug("Discovered issuer %s", microsoftIssuer.issuer);
  const microsoftOidcClient = new microsoftIssuer.Client(
    getMicrosoftClientConfig(),
  );
  console.debug("Built Microsoft client: %O", microsoftOidcClient);
  customPassport.use(
    "microsoft-oidc",
    getMicrosoftOidcStrategy(microsoftOidcClient),
  );

  // note that we don't serialize the user in any meaningful way - we just store the entire jwt in session
  // i.e. req.session.passport.user == { jwt: "..." }
  customPassport.use("google", googleStrategy);
  customPassport.serializeUser((user: Express.User, done) => {
    done(null, user);
  });
  customPassport.deserializeUser((user: Express.User, done) => {
    done(null, user);
  });

  // tsc dislikes the use of 'this' in the passportjs codebase, so we cast explicitly
  return customPassport as Authenticator;
};
