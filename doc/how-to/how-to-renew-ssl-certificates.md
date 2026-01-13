# How to renew SSL certificates

## Context 🖼️
Teams can setup custom subdomains for PlanX so that the service can be accessed via their domain (e.g. https://planningservices.medway.gov.uk/). 

This guide will walk through the process of updating the certificate for an existing custom domain . It will require actions by both PlanX developers and council IT teams.

The steps taken below are a subset of the steps required to [setup a custom subdomain](https://github.com/theopensystemslab/planx-new/blob/main/doc/how-to/how-to-setup-custom-subdomains.md).

## Process ⚙️

1. **PlanX** - Provide IT team with Certificate Signing Request (CSR), or request private `.key` and `.cert` directly.

    If providing a CSR, the IT team will need to tell us what to put [in each of the fields](https://en.wikipedia.org/wiki/Certificate_signing_request#Procedure).

    **How to generate a CSR**
    ```shell
    openssl req -new -newkey rsa:4096 -nodes -keyout <TEAM_NAME>.key -out <TEAM_NAME>.csr
    ```

    The `<TEAM_NAME>.csr` file can then passed along to the IT team who should respond with a certificate and intermediary/chain certificate (next step). 

    The `<TEAM_NAME>.key` file should be kept, we require this for step 5 onwards.

    Please save these files to the PlanX vault on 1Password - this ensures that there's a backup than can be accessed by anybody on the dev team.

2. **IT Team** - Provide PlanX with certificates (details in documentation above)
    - Certificates can be provided as individual files, or in an archive format (`.pfx`, `.pkcs12`, `.p12`)

    - If provided as a `.pem`, you can convert to `.pfx` using this command in order to continue with step 4: 
    ```shell
    openssl pkcs12 -inkey <TEAM_NAME>.key -in <FILENAME>.pem -export -out <TEAM_NAME>.pfx
    ```

3. **PlanX** - Format certificates if provided with PKCS #12 (password protected `.p12` or `.pfx`)
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
    openssl pkcs7 -inform der -in <FILENAME> -out council.cert
    ```
    
    The `council.cert` file output above might contain the certificate chain inside it, so please separate the first certificate in the file (the certificate body as `council.cert`) from the rest of the certificates in the file (the certificate chain as `chain.cert`) before proceeding with step 6.2. If multiple certificate formats are returned by the council, it's possible not all will include chain (or root) certificates. If provided, we should include the chain certificates.

4. **PlanX** - Validate certificates manually in AWS Console (optional but recommended)
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

5. **PlanX** - Create or update certificates via AWS Secrets Manager by running the following script - 

```sh
cd scripts
bash add-certs-to-aws-secrets-manager.sh {team}
```
If you encounter config errors while running this script, you may have to run `aws configure`. For the keys / IDs you need, go to the AWS Access Portal, go to `production` -> `access keys` -> `Get credentials for ssl-dev-tasks`.

You'll see a success or error message when this script runs, and you could additionally check the `ssl/{team}` secret in the AWS console to verify this step.

Alternatively, you can do this manually via the AWS console. If you choose this option you'll need to ensure you preserve line breaks (`\n`).


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

10.  **PlanX** - Add certificate expiry date to [PlanX CMS on Notion](https://www.notion.so/opensystemslab/Plan-CRM-27c35d469ad1806c8f4dd95067ccf4ff)