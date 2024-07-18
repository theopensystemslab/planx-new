import { custom, Issuer } from "openid-client";
import passport from "passport";

import { googleStrategy } from "./strategy/google";
import {
  getMicrosoftOidcStrategy,
  getMicrosoftClientConfig,
  MICROSOFT_OPENID_CONFIG_URL,
} from "./strategy/microsoft-oidc";

const setupPassport = () => {
  // TODO: remove below config (timeout extended for local testing with poor connection)
  custom.setHttpOptionsDefaults({
    timeout: 10000,
  });

  // explicitly instantiate new passport for clarity
  const passportWithStrategies = new passport.Passport();

  // build Microsoft OIDC client, and use it to build the related strategy
  let microsoftOidcClient;
  Issuer.discover(MICROSOFT_OPENID_CONFIG_URL).then((microsoftIssuer) => {
    console.debug("Discovered issuer %s", microsoftIssuer.issuer);
    const microsoftClientConfig = getMicrosoftClientConfig();
    microsoftOidcClient = new microsoftIssuer.Client(microsoftClientConfig);
    console.debug("Built Microsoft client: %O", microsoftOidcClient);
    passportWithStrategies.use(
      "microsoft-oidc",
      getMicrosoftOidcStrategy(microsoftOidcClient),
    );
  });

  // do any other aspects of passport setup which can be handled here
  passportWithStrategies.use("google", googleStrategy);
  passportWithStrategies.serializeUser((user: any, done) => {
    done(null, user);
  });
  passportWithStrategies.deserializeUser((obj: any, done) => {
    done(null, obj);
  });

  return { passportWithStrategies, microsoftOidcClient };
};

// instantiate and export the new passport class and Microsoft client as early as possible
const { passportWithStrategies, microsoftOidcClient } = setupPassport();
export { passportWithStrategies, microsoftOidcClient };
