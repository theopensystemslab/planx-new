# How to add a secret
This document describes our processes for adding a new secret to the PlanX application, and how to deploy this across Pizza, Staging and Production environments.

This guide will demonstrate how to - 
 - Added a secret to our local development environment
 - Push this to S3 for Pizza builds to access
 - Add a secret to Pulumi for Staging and Production environments
 - Finally, pass secrets into a Fargate service where it can be referenced by the application

## Process

**Setup**
1. Generate a secret [using the existing process](how-to-generate-a-secret.md), or obtain one from a third-party integration
2. Add to your local `.env` file for local development
   - Note: This file is never checked into our public repository and is listed in our `.gitignore` config
3. Document the secret in `.env.example`

**Docker Environments (Local development + Pizza environments)**
To pass a secret into our Docker Compose setup you will need to map it into the relevant container in `docker-compose.yml`. For example - 

```yml
  api:
    build:
      ...
    depends_on:
      ...  
    environment:
      YOUR_NEW_SECRET: ${YOUR_NEW_SECRET}
```

You will then be able to refer to it in code via `process.env.YOUR_NEW_SECRET` and test on your local machine.

When building Pizza environments for testing, GitHub actions access secrets via S3 using the `pull-secrets.sh` script. In order to push changes to your local `.env`, you will need to run the `push-secrets.sh` script which will push your local changes to S3.

> Please be aware that if you are rotating secrets this may affect existing Pizzas which will need to be rebuilt. This can be done manually in GitHub by re-running the latest action associated with affected PRs.


**AWS / Pulumi Environments (Staging + Production environments)**
Secrets for Staging and Production environment are not handled in `.env` files, and are set directly in Pulumi, our Infrastruture as Code (IaC) platform.

These values are set using the [Pulumi CLI](https://www.pulumi.com/docs/reference/cli/)

Here's an example of adding a secret to the `application` layer of the staging and production environments - 

```sh
cd infrastructure/application
pulumi config set your-new-secret abc123 --secret --stack staging
pulumi config set your-new-secret xyz789 --secret --stack production
```

> ⚠️ Secrets should not be shared across multiple environments

This will then update `Pulumi.staging.yaml` and `Pulumi.production.yaml` with an encrypted copy of the new secret. These files are checked into our repository. Environmental variables which do not require encryption can be stored as plaintext by omitting the `--secret` flag.

These secrets can then be referred to in our Pulumi IaC code using `config.require()`, and passed into services as follows - 

```ts
const apiService = new awsx.ecs.FargateService("api", {
  container: {
    environment: [
      {
        name: "YOUR_NEW_SECRET",
        value: config.require("your-new-secret"),
      },
    ],
  },
  ...
});
```

> Pulumi uses our Docker images to construct Fargate services. This means that the "name" value above must match that used in Docker.