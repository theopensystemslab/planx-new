# How to set up AWS SSO credentials
This document describes the process of setting up credentials for your local AWS CLI. This will enable you to interact directly with our infrastructure using the CLI, as well as provision infrastructure using Pulumi.

## Process
As part of onboarding, you should be set up to access AWS via [the SSO portal](https://opensystemslab.awsapps.com/start#/). Please ensure that you have set up and enabled MFA.

1. Download the AWS CLI
1. Run `aws configure sso` - the required details can be found via the SSO portal
1. For the "profile" field please use the format `planx-<STACK>`, e.g. `planx-staging`
1. Repeat for all environments (staging, production)
1. Test! You should be able to call commands using the CLI, for example `aws sts get-caller-identity --profile planx-staging` and get the expected result.

Occasionally, you'll be prompted to refresh your credentials, this can be done via `aws sso login --profile <PROFILE>`