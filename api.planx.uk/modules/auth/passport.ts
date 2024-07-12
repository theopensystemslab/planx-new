import { custom, Issuer } from 'openid-client';
import passport from 'passport';

import { googleStrategy } from './strategy/google';
import { getMicrosoftOidcStrategy } from './strategy/microsoft-oidc';

const MICROSOFT_OPENID_CONFIG_URL = "https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration";

// we need the client in various files, so it needs to be instantiated early on, and exported
let client;

// TODO: reset timeout (extended for local testing with poor connection)
custom.setHttpOptionsDefaults({
  timeout: 10000,
})
console.log("ATTEMPTING TO DISCOVER METADATA DOC")
Issuer.discover(MICROSOFT_OPENID_CONFIG_URL).then(microsoftIssuer => {
  console.log(
    "Discovered issuer %s %O",
    microsoftIssuer.issuer,
    microsoftIssuer.metadata,
  );

  const client_id = process.env.MICROSOFT_CLIENT_ID!;
  if (typeof client_id !== 'string') {
    throw new Error('No MICROSOFT_CLIENT_ID in the environment');
  }
  
  client = new microsoftIssuer.Client({
    client_id: client_id,
    client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
    redirect_uris: [`${process.env.API_URL_EXT}/auth/microsoft/callback`],
    post_logout_redirect_uris: [process.env.EDITOR_URL_EXT!],
    response_types: ["id_token"],
  });

  console.log("Built Microsoft client:");
  console.log(client);

  passport.use('google', googleStrategy);
  passport.use('microsoft-oidc', getMicrosoftOidcStrategy(client));

  passport.serializeUser((user: any, done) => {
    console.log("SERIALIZING USER")
    console.log(user)
    done(null, user);
  });

  passport.deserializeUser((obj: any, done) => {
    console.log("DESERIALIZING USER")
    console.log(obj)
    done(null, obj);
  });
});

export { passport, client };