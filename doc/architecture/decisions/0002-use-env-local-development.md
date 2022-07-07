# 2. Use .env.local.development to manage secrets

Date: 2022-07-07

## Status

Accepted

## Context

Due to a growing number of customer secrets, in particular multiple Uniform credentials per team, we need a reliable and secure method to store these for local development. A growing list of environmental variables, and the manual mapping of these, in our Docker Compose could be error prone.

## Decision

 - Use an `.env.local.development` file, which is imported into the Docker Compose service used for local development.
 - A dummy file has been added to the repository. This will inform new developers of the process, and prompt them to replace the file. Docker Compose also requires that this file exists.
 - A subsequent PR will add this file to our `.gitignore` to ensure that this does not get checked into the repository.
 - This file will be stored in OSL's secrets manager for sharing securely between developers.

## Consequences

- Simplification of secret management.
- Lowering burden of manually importing multiple secrets into the Docker Compose file.
- When we rotate API keys etc prior to opening up the repository, we can decide to remove certain environment variables from the current `.env`.
- In future, this could allow us to use the [1Password API](https://developer.1password.com/docs/connect/connect-api-reference/#get-file-content) to automate the population of secrets to the Pizza (test) environment as part of our CI/CD. This would also reduce the current requirement to manage an additional list of secrets in GitHub.
