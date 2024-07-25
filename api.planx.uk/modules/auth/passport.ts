import { Issuer } from "openid-client";
import type { Authenticator } from "passport";
import passport from "passport";

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

  // do other aspects of passport setup which can be handled here
  // TODO: replace types here (e.g. user: Express.User - but verify this first)
  customPassport.use("google", googleStrategy);
  customPassport.serializeUser((user: any, done) => {
    done(null, user);
  });
  customPassport.deserializeUser((obj: any, done) => {
    done(null, obj);
  });

  // tsc dislikes the use of 'this' in the passportjs codebase, so we cast explicitly
  return customPassport as Authenticator;
};
