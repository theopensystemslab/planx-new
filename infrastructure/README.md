# Infrastructure

We use Pulumi to write Infrastructure-as-Code in TypeScript.
The code is split up into separate layers, so as to isolate changes and minimize the chance of losing data:

1. `networking`: basic VPC setup which should rarely change
2. `data`: persistent data layer - contains S3 buckets and RDS databases
3. `certificates`: SSL certs for our domains
4. `application`: the application layer - includes the frontend and services

# CD/CI

Only the `application` layer is automatically deployed via CI via the `pulumi_preview` job. The other stacks change infrequently and need to be manually deployed. 

# Provisioning the first three layers manually

The SysAdmin should provision the layers `networking`, `certificates`, and `data` for each stack manually.

The stacks are:

- `production`
- `staging`
- `sandbox`

Steps:

1. Install [Docker](https://docs.docker.com/get-docker/)
1. Install the [Pulumi CLI](https://www.pulumi.com/docs/reference/cli/)
1. Setup AWS credentials for Pulumi IAM role. Profile names should have the format `planx-<STACK>-pulumi`.
1. Log in to the Pulumi CLI using your PAT (`pulumi login`)
1. Install project dependencies at root (`pnpm i`), this will install dependencies for all layers
1. Provision layers manually (`cd <LAYER_DIR> && pulumi up --stack <STACK>`)

We use the `sandbox` environment to test IaC changes. The `application` layer is also manually deployed from the local developer's machine, and not via CI.

### What about the secrets?

Pulumi holds the encryption keys only. We hold the ciphertext. This means Pulumi can never access our secrets.  If we wanted to, we could set up pulumi to use an S3 bucket instead of relying on their services, but this would add complexity as using IaC to set up the S3 bucket to host IaC's secrets is a bit of a chicken-and-the-egg situation. It's good to know it's doable but not worth the effort at the moment.
