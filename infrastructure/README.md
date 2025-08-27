# Infrastructure

We use Pulumi to write Infrastructure-as-Code in TypeScript.
The code is split up into separate layers, so as to isolate changes and minimize the chance of losing data:

1. `networking`: basic VPC setup which should rarely change
2. `data`: persistent data layer - contains S3 buckets and RDS databases
3. `certificates`: SSL certs for our domains
4. `application`: the application layer - includes the frontend and services

# CD/CI

Only the `application` layer is automatically deployed via CI via the `pulumi_preview` job. The other stacks change infrequently and need to be manually deployed. 

# Secrets and environmental variables
We store these values in two ways - YAML files within the public repository, and via the Pulumi ESC platform. Regardless of the method of storage, secrets and env vars are handled and read within Pulumi IaC code in the same way - by calling `pulumi.getConfig()`.

## Environmental variables
Environmental variables (public information - e.g. memory size, CPU size, scaling details) are managed via [Pulumi configuration files](https://www.pulumi.com/docs/iac/concepts/config/). These can be written directly as YAML, or via the [Pulumi CLI tool](https://www.pulumi.com/docs/iac/download-install/) (see example below).

```sh
# Writing variables
pulumi config set someVar someValue --stack {stack}
# pulumi.{stack}.yaml now updated with plain-text env var, this can be committed to public repo

# Reading variables
pulumi config get someVar --stack {stack}
```

## Secrets
Secrets (private information - e.g. API keys, database passwords, SSL certificate keys) are managed via [Pulumi ESC](https://www.pulumi.com/docs/esc/). These can be managed entirely within the [ESC web console](https://app.pulumi.com/planx) or via the [ESC CLI tool](https://www.pulumi.com/docs/esc/download-install/) (see example below).

```sh
# Writing secrets
esc env set {layer}/{stack} pulumiConfig.{layer}:someVar someValue --secret

# For example...
esc env set application/staging pulumiConfig.application:someVar someValue --secret
# Pulumi ESC now updated. This can be checked via the web console, `esc env get {layer}/{stack}` or `pulumi config get someVar`

# Reading variables
pulumi config get someVar --stack {stack}

# Alternatively...
esc env get {layer}/{stack} pulumiConfig.application:someVar --show-secret
```

# Provisioning the first three layers manually

The SysAdmin should provision the layers `networking`, `certificates`, and `data` for each stack manually.

The stacks are:

- `production`
- `staging`

Steps:

1. Install [Docker](https://docs.docker.com/get-docker/)
2. Install the [Pulumi CLI](https://www.pulumi.com/docs/reference/cli/)
3. Install the [Pulumi ESC CLI](https://www.pulumi.com/docs/esc/download-install/)
4. Setup AWS credentials for Pulumi IAM role. Profile names should have the format `planx-<STACK>-pulumi`.
5. Log in to the Pulumi CLI using your PAT (`pulumi login`)
6. Log in to the Pulumi ESC CLI using your PAT (`esc login`)
7. Install project dependencies at root (`pnpm i`), this will install dependencies for all layers
8. Provision layers manually (`cd <LAYER_DIR> && pulumi up --stack <STACK>`)

### What about the secrets?

Pulumi holds the encryption keys only. We hold the ciphertext. This means Pulumi can never access our secrets.  If we wanted to, we could set up pulumi to use an S3 bucket instead of relying on their services, but this would add complexity as using IaC to set up the S3 bucket to host IaC's secrets is a bit of a chicken-and-the-egg situation. It's good to know it's doable but not worth the effort at the moment.
