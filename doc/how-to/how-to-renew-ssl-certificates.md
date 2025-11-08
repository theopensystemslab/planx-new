# How to renew SSL certificates

## Context 🖼️
Teams can setup custom subdomains for PlanX so that the service can be accessed via their domain (e.g. https://planningservices.medway.gov.uk/). 

This guide will walk through the process of updating the certificate for an existing custom domain . It will require actions by both PlanX developers and council IT teams.

The steps taken below are a subset of the steps required to setup a custom subdomain. Further details on all steps below can been found  on the ["How to setup custom subdomain" documentation](https://github.com/theopensystemslab/planx-new/blob/main/doc/how-to/how-to-setup-custom-subdomains.md).

## Process ⚙️

1. **PlanX** - Provide IT team with Certificate Signing Request (CSR), or request private `.key` and `.cert` directly

2. **IT Team** - Provide PlanX with certificates

3. **PlanX** - Format certificates if provided with PKCS #12

4. **PlanX** - Validate certificates manually in AWS Console (optional but recommended)

5. **PlanX** - Create or update certificates via AWS Secrets Manager by running the following script - 

```sh
cd scripts
bash add-certs-to-aws-secrets-manager.sh {team}
```

You'll see a success or error message when this script runs, and you could additionally check the `ssl/{team}` secret in the AWS console to verify this step.

6. **PlanX** - Remove old certificates from Pulumi config

```sh
cd infrastructure/application
pulumi config rm ssl-{team}-key --stack production
pulumi config rm ssl-{team}-cert --stack production
pulumi config rm ssl-{team}-chain --stack production
```

7. **PlanX** - Update `CUSTOM_DOMAINS` to remove `certificateLocation: "pulumiConfig"` from your team

8. **PlanX** - Deploy to production

9. **PlanX** - Email/Slack council PO to confirm success

10.  **PlanX** - Add certificate expiry date to [PlanX CMS on Notion](https://www.notion.so/opensystemslab/Plan-Customers-dee2cdfb40c04b5fa88edc5a86989211)