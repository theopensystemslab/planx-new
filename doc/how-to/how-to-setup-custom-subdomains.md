# How to setup custom subdomains

## Context 🖼️
Teams can setup custom subdomains for PlanX so that the service can be accessed via their domain (e.g. https://planningservices.medway.gov.uk/).

This guide will walk through the process of setting a custom domain for a new team. It will require actions by both PlanX developers and council IT teams.

## Process ⚙️
1. **PlanX** - Provide IT team with documentation listing what's required. This is part of the onboarding process and briefly outlines the process. Documentation - https://www.notion.so/opensystemslab/IT-systems-services-d4f8b88fb9694f33a24411801150c793

    > ⚠️ **Requirements**
    >
    > AWS CloudFront has a few restrictions which are listed in the public documentation above which are shared with the IT Team, notably - 
    >  - Self signed certificates are not accepted ([AWS Docs](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/using-https-cloudfront-to-custom-origin.html))
    >
    > The steps below will show how to validate the above.

2. **PlanX** - Provide IT team with Certificate Signing Request (CSR) if requested. The IT team will need to tell us what to put [in each of the fields](https://en.wikipedia.org/wiki/Certificate_signing_request#Procedure).

    **How to generate a CSR**
    ```shell
    openssl req -new -newkey rsa:4096 -nodes -keyout <TEAM_NAME>.key -out <TEAM_NAME>.csr
    ```

    The `<TEAM_NAME>.csr` file can then passed along to the IT team who should respond with a certificate and intermediary/chain certificate (next step). 

    The `<TEAM_NAME>.key` file should be kept, we require this for step 5 onwards.

    Please save these files to the PlanX vault on 1Password - this ensures that there's a backup than can be accessed by anybody on the dev team.


3. **IT Team** - Provide PlanX with certificates (details in documentation above)
    - Certificates can be provided as individual files, or in an archive format (`.pfx`, `.pkcs12`, `.p12`)

    - If provided as a `.pem`, you can convert to `.pfx` using this command in order to continue with step 4: 
    ```shell
    openssl pkcs12 -inkey <TEAM_NAME>.key -in <FILENAME>.pem -export -out <TEAM_NAME>.pfx
    ```

4. **PlanX** - Format certificates if provided with PKCS #12 (password protected `.p12` or `.pfx`)
    - Using `<TEAM_NAME>.pfx` as `<FILENAME>`, run the following: 

    ```shell
    openssl pkcs12 -nocerts -nodes -in <FILENAME> -out council.key [ -password 'pass:<PASSWORD>' ] [ -legacy ]
    openssl pkcs12 -nokeys -in <FILENAME> -out council.cert [ -password 'pass:<PASSWORD>' ] [ -legacy ]
    ```

    > 💡**Tip**
    > 
    > Try adding the `-legacy` flag to the above command if you get an "Error outputting keys and certificates" error

    If the certificate is provided as a PKCS #7 (`.p7b`) file, it can be decoded as follows - 

    ```shell
    openssl pkcs7 -print_certs -in <FILENAME> -out council.cert
    ```
    
    The `council.cert` file output above might contain the certificate chain inside it, so please separate the first certificate in the file (the certificate body as `council.cert`) from the rest of the certificates in the file (the certificate chain as `chain.cert`) before proceeding with step 6.2. If multiple certificate formats are returned by the council, it's possible not all will include chain (or root) certificates. If provided, we should include the chain certificates.

5. **PlanX** - Validate certificates manually in AWS Console (optional but recommended)
  
    To avoid slow round trip loops of Pizza -> Staging -> Production, certificates can be manually imported via the AWS Console to check their validity before proceeding.

    In order to do this -

      - Log into AWS staging 
      - Navigate to AWS Certificate Manager (ACM)
      - Change to region to us-east-1 (N.Virginia) (required for CloudFront)
      - Import certificate (copy cert, key and chain into form)
      - Check the following after import - 
        - Subdomain is correct ✅
        - CloudFront is listed under "Can be used with" heading ✅
      - If the above checks pass, delete the test certificate from the AWS Certificate Manager dashboard, and proceed to the next step

6. **PlanX** - Add certificates to AWS infrastructure

    Certificates and keys are added to our infrastructure as Pulumi secrets which are then read to generate an ACM record and CloudFront distribution for the custom domain when a deployment is made to Production.

    1. Add the team to the `CUSTOM_DOMAINS` array in `infrastructure/application/index.ts`. Remove `certificateLocation` if present (we have already configured `secretsManager` elsewhere).

    2. Add secrets to AWS Secrets Manager

        The provided files, or output of step 4, can be read by the following script to write a secret to AWS SM.

        ```bash
        cd scripts
        bash add-certs-to-aws-secrets-manager.sh {team}
        ```

        If you encounter config errors while running this script, you may have to run `aws configure`. For the keys / IDs you need, go to the AWS Access Portal, go to `production` -> `access keys` -> `Get credentials for ssl-dev-tasks`.

        You'll see a success or error message when this script runs, and you could additionally check the `ssl/{team}` secret in the AWS console to verify this step.
        
        Alternatively, you can do this manually via the AWS console. If you choose this option you'll need to ensure you preserve line breaks (`\n`).

7. **PlanX** - Deploy to production in order to create ACM records and CloudFront CDN

8. **PlanX** - Provide IT team with domain of CloudFront CDN. This will be in format `<abc123>.cloudfront.net` and is listed on the CloudFront dashboard (via AWS Console).
  
9. **IT Team** - Create CNAME DNS record pointing at `<abc123>.cloudfront.net`

10. **PlanX** - Point application to new custom domain

  - Add subdomain to `PREVIEW_ONLY_DOMAINS` in the PlanX frontend. This is located in `apps/editor.planx.uk/src/routes/utils.ts`
  - Add subdomain to `getEnvForAllowedHosts()` in the PlanX frontend. This is located in `apps/editor.planx.uk/src/airbrake.ts`
  - Add subdomain to `team.domain` column via Hasura in the production console only.
  
11. **PlanX** - Add custom domain to UptimeRobot (create monitor & also select SSL reminders)

> [!NOTE]
> We do not have individual named logins for our UptimeRobot account. Instead we have one single shared one in the 1Password "root/admin" vault, which not everyone will have access to. 
>
> Therefore you might need to ask someone to do this step for you if you do not have access.

12. **PlanX** - Add certificate expiry date to [PlanX CMS on Notion](https://www.notion.so/opensystemslab/Plan-CRM-27c35d469ad1806c8f4dd95067ccf4ff)