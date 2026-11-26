# How to setup Azure application for Microsoft OIDC

## Context

One of the more complicated aspects of implementing the Microsoft single sign on via OpenID Connect (see ADR#0008) is setting up an appropriate application on Azure (Microsoft's cloud platform).

We document the process here for posterity/future reproducibility.

## Process 

1. Start a new registration in the [App registrations](https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade) panel (this will automatically create a corresponding [Enterprise application](https://portal.azure.com/#view/Microsoft_AAD_IAM/StartboardApplicationsMenuBlade/~/AppAppsPreview))
2. We will support account types ‘in any organizational directory’ (i.e. multitenant), *and* personal accounts
3. Register the application as an SPA, with the following redirect URIs:
    -  `https://api.editor.planx.uk/auth/microsoft/callback` (production)
    -  `https://api.editor.planx.dev/auth/microsoft/callback` (staging)
    -  `http://localhost/auth/microsoft/callback` (local development)
3. Navigate to *Manage/Authentication*, and allow ID tokens (access tokens are not needed)
4. No client secret is needed (so nothing needs adding under *Manage/Certificates and secrets*) - we use the `id_token` + `form_post` flow, where Microsoft posts a signed ID token straight to our callback and we never call the token endpoint
5. Go to *Overview*, and copy the `Application (client) ID` - this is your `MICROSOFT_CLIENT_ID`
