# How to setup custom subdomains

## Context 🖼️
Teams can setup custom subdomains for PlanX so that the service can be accessed via their domain (e.g. https://planningservices.medway.gov.uk/).

This guide will walk through the process of setting a custom domain for a new team. It will require actions by both PlanX developers and council IT teams.

## Process ⚙️
1. **PlanX** - Provide IT team with documentation listing what's required. This is part of the onboarding process and briefly outlines the process. Documentation - https://www.notion.so/opensystemslab/IT-systems-services-d4f8b88fb9694f33a24411801150c793

    > ⚠️ **Requirements**
    >
    > AWS CloudFront has a few restrictions which are listed in the public documentation above which are shared with the IT Team, notably - 
    >  - Keys can be a maximum of 2048-bit ([AWS Docs](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/cnames-and-https-requirements.html))
    >  - Self signed certificates are not accepted ([AWS Docs](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/using-https-cloudfront-to-custom-origin.html))
    >
    > The steps below will show how to validate the above.

2. **PlanX** - Provide IT team with Certificate Signing Request (CSR) if requested. The IT team will need to tell us what to put [in each of the fields](https://en.wikipedia.org/wiki/Certificate_signing_request#Procedure).

    **How to generate a CSR**
    ```shell
    openssl req -new -newkey rsa:2048 -nodes -keyout <TEAM_NAME>.key -out <TEAM_NAME>.csr
    ```

    The `<TEAM_NAME>.csr` file can then passed along to the IT team who should respond with a certificate and intermediary/chain certificate (next step). 

    The `<TEAM_NAME>.key` file should be kept, we require this for step 5 onwards.


3. **IT Team** - Provide PlanX with certificates (details in documentation above)
    - Certificates can be provided as individual files, or in an archive format (`.pfx`, `.pkcs12`, `.p12`)

4. **PlanX** - Format certificates if provided with PKCS #12
    ```shell
    openssl pkcs12 -nocerts -nodes -in <FILENAME> -out council.key
    openssl pkcs12 -nokeys -in <FILENAME> -out council.cert
    ```
    
    The `.cert` file might contain the certificate chain inside it, so please separate the first certificate in the file (the certificate body) from the rest of the certificates in the file (the certificate chain).

5. **PlanX** - Validate certificates manually in AWS Console (optional but recommended)
  
    To avoid slow round trip loops of Pizza -> Staging -> Production, certificates can be manually imported via the AWS Console to check their validity before proceeding.

    In order to do this -

      - Log into AWS staging 
      - Navigate to AWS Certificate Manager (ACM)
      - Change to region to us-east-1 (N.Virginia) (required for CloudFront)
      - Import certificate (copy cert, key and chain into form)
      - Check the following after import - 
        - Subdomain is correct ✅
        - Key algorithm is RSA 2048 ✅
        - CloudFront is listed under "Can be used with" heading ✅
      - If the above checks pass, delete the test certificate from the AWS Certificate Manager dashboard, and proceed to the next step

6. **PlanX** - Add certificates to AWS infrastructure

    Certificates and keys are added to our infrastructure as Pulumi secrets which are then read to generate an ACM record and CloudFront distribution for the custom domain when a deployment is made to Production.

    1. Add the team to the `CUSTOM_DOMAINS` array in `infrastructure/application/index.ts`

    2. Add secrets to Pulumi

        The following secrets need to be added to the Pulumi application layer - `ssl-{team}-key`, `ssl-{team}-cert` and `ssl-{team}-chain` (optional). These secrets are only required for the production stack.

        The provided files, or output of step 4, can be piped directly into these variables.

        ```bash
        cd infrastructure/application

        cat council.key | pulumi config set ssl-{team}-key --stack production --secret

        cat council.cert | pulumi config set ssl-{team}-cert --stack production --secret

        cat chain.cert | pulumi config set ssl-{team}-chain --stack production --secret
        ```

        To validate that you have successfully added the secrets to Pulumi, check `infrastructure/application/Pulumi.production.yaml` which will list the above secrets for the team in an encrypted format.

7. **PlanX** - Deploy to production in order to create ACM records and CloudFront CDN

8. **PlanX** - Provide IT team with domain of CloudFront CDN. This will be in format `<abc123>.cloudfront.net` and is listed on the CloudFront dashboard (via AWS Console).
  
9. **IT Team** - Create CNAME DNS record pointing at `<abc123>.cloudfront.net`

10. **PlanX** - Point application to new custom domain

  - Add subdomain to `PREVIEW_ONLY_DOMAINS` in the PlanX frontend. This is located in `editor.planx.uk/src/routes/utils.ts`
  - Add subdomain to `getEnvForAllowedHosts()` in the PlanX frontend. This is located in `editor.planx.uk/src/airbrake.ts`
  - Add subdomain to `team.domain` column via Hasura
  
11.  **PlanX** - Add custom domain to UptimeRobot (create monitor & also select SSL reminders)

12. **PlanX** - Add certificate expiry date to [PlanX CMS on Notion](https://www.notion.so/opensystemslab/Plan-Customers-dee2cdfb40c04b5fa88edc5a86989211)