# 4. Secret Generation

Date: 2022-12-07

## Status

Proposed

## Context

An integration recently failed when a new secret was generated containing special characters which was not properly escaped. This highlighted the need to have a documented and standard process for generating new secrets.

## Decision

The following process is to be adopted for secret generation - 

1. Generate a new secret using 1Password. All PlanX developers have access to this tool as standard.
2. Secrets can contain special characters, as long as they are properly escaped in the `.env` file.
   - Please see [`dotenv` docs](https://github.com/motdotla/dotenv/blob/master/README.md#what-rules-does-the-parsing-engine-follow) for implementation details
3. Follow [the current process for adding secrets](https://github.com/theopensystemslab/planx-new/blob/main/doc/how-to/how-to-add-a-secret.md) to the application

## Principles
- Staging and Production environments should not share secrets
- Staging and Pizza environments can share secrets where required (e.g. Google OAuth)
- When required to share a secrets with external partners (e.g. BOPS) this should be done through a secure service such as https://onetimesecret.com/. External partners should also be encouraged to use secure channels to share secrets with us.

![1Password "Create Password" tool](./img/0004-secret-generation.png)


## Consequences

This will ensure that we have a repeatable and standard process for generating secrets, which should mitigate further integration failures due to malformed secrets in future.
