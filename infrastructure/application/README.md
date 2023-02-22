# Application stack

This stack holds our application layer, including the following services:
- [Hasura](https://hasura.editor.planx.uk)
- [API](https://api.editor.planx.uk)
- [ShareDB](https://sharedb.editor.planx.uk)
- [Editor](https://editor.planx.uk)
- [Metabase](https://metabase.editor.planx.uk)

## Custom domains

In order to set up custom domains for council services:

1. Refer to our [public documentation on Notion](https://www.notion.so/IT-systems-services-d4f8b88fb9694f33a24411801150c793) (see section titled "Custom Subdomains") for what information we need from councils in order to set up a custom domain for them.
2. Add the desired subdomain to the constant `CUSTOM_DOMAINS` in [index.ts]().
3. Look at the definition of `createCustomDomain` on [index.ts]() for instructions on how to set up SSL certificates for the new domain (i.e. using `pulumi config`).

Tip: After step (2), you can execute `pulumi preview` and it'll tell you exactly which Pulumi configs are missing.
