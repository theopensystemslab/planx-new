import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { Issuer } from "openid-client";
import type { IssuerMetadata } from "openid-client";
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
  // we also keep said config as a fixture to enable offline local development
  let microsoftIssuer;
  if (
    process.env.APP_ENVIRONMENT == "development" &&
    process.env.DEVELOP_OFFLINE
  ) {
    console.info(
      "Working offline: using saved Microsoft OIDC configuration in auth/fixtures",
    );
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const fixturePath = path.resolve(
      __dirname,
      "fixtures",
      "microsoft-openid-configuration.json",
    );
    const microsoftIssuerConfig: IssuerMetadata = JSON.parse(
      fs.readFileSync(fixturePath, "utf-8"),
    );
    microsoftIssuer = new Issuer(microsoftIssuerConfig);
  } else {
    microsoftIssuer = await Issuer.discover(MICROSOFT_OPENID_CONFIG_URL);
  }
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
