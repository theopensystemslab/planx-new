# How to setup custom domains

## Context 🖼️

Teams can access PlanX via a custom subdomain on their own domain (e.g. `https://planningservices.medway.gov.uk/`).

Custom domains are ideally served by a **shared CloudFront distribution** backed by a single DNS-validated ACM certificate (which we abbreviate as 'cert' hereafter). This replaces the legacy model where each council's custom domain had its own dedicated CloudFront distribution and had to provide us with an SSL cert.

Because the shared cert is DNS-validated and managed by AWS, **it will auto-renew** — there is no manual renewal process (see [Appendix A](#appendix-a-automatic-certificate-renewal)). All that is required of council IT teams is for them to add 2 DNS records (usually, they can add both simultaneously).

Note that we have a [public-facing onboarding document](https://opensystemslab.notion.site/9-Set-up-custom-subdomains-3000ef5212cc43a5a88f46563142f82a) that you can send to councils for an abbreviated explanation of this system from their perspective.

NB. We generally assume a 1-to-1 relationship between councils and their custom domains, so we sometimes use these terms in place of each other.

### Source of truth

All custom domains are defined in [`infrastructure/common/customDomains.ts`](../../infrastructure/common/customDomains.ts). Each entry has a `cloudFrontState` string describing where it is in the lifecycle:

| `cloudFrontState` | Actual state of infrastructure |
| --- | --- |
| `validation-only` | Domain is not associated with any CDN, but is on the "mining" certificate (cert) to surface DNS validation records (which we will send to council). |
| `legacy-with-validation` | Domain is associated with (i.e. is an alias of) legacy CDN, which is backed by a council-provided cert. Domain is also on mining cert. |
| `cutover-ongoing` | Initially, domain is still associated with legacy CDN. We ensure shared CDN exists, and is backed by a shared cert provisioned by us, which includes the domain as an [SAN](https://support.dnsimple.com/articles/what-is-ssl-san/). Once the council swaps their DNS record, we associate the domain with the shared CDN. At this point, the legacy CDN still exists but has no aliases.
| `shared-final` | Domain is associated with shared CDN. The legacy CDN, if this was a migration, has been torn down (otherwise, it never existed). This will be the eventual final state for all domains. |

NB. We largely use 'CDN' and '[CloudFront] distribution' interchangeably throughout this document, although this is a simplification.

### Deploy ordering

Correct sequencing is important! Usually, the `certificates` stack must be deployed (manually) _before_ the `application` stack, for example because it exports the shared certificate ARN via a Pulumi stack reference.

However, there are exceptions. When it comes to tearing down legacy CloudFront distributions, we have to delete those first (i.e. deploy `application`) _before_ we delete the attached cert (i.e. deploy `certificates`).

- **Certificates** — manually deployed (see `infrastructure/README.md`)
- **Application** — deployed by CI on every merge to `main` (staging) or on every `production` rollout


## Process ⚙️

There are two paths here. You are either (A) [onboarding a new council](#a-onboarding-a-new-council) who have no existing custom domain, or (B) [migrating a council](#b-migrating-a-council-from-legacy-setup) with an existing custom domain from the legacy infrastructure setup to the new, shared CDN setup.

In either case, please read through all the steps before starting, for best results.

NB. We assume here that you want to run the relevant infra on production.


### A. Onboarding a new council

Path: `validation-only` → `shared-final`

1. Pull latest `main`, open a new branch, and add the desired new domain to the array in `infrastructure/common/customDomains.ts`:

    ```ts
    {
      name: "a-new-council",
      domain: "planningservices.a-new-council.gov.uk",
      cloudFrontState: "validation-only",
    },
    ```

    Then commit this change. Note that `certificateLocation` is not necessary here.

2. Deploy the `certificates` stack. Make sure you have the appropriate AWS credentials/profile exported in your terminal, then run:

    ```sh
    cd infrastructure/certificates
    pulumi up --refresh --stack production
    ```

    This creates or updates the mining certificate (called thus because we 'mine' it for DNS validation records) with the new domain as an SAN. AWS ACM generates a CNAME record the council must add to prove domain ownership.

3. Read the pending DNS records

    ```sh
    pulumi stack output pendingCouncilDnsRecords --stack production --json
    ```

    Output should look like:

    ```json
    [
      {
        "domain": "planningservices.a-new-council.gov.uk",
        "validationCname": {
          "name": "_abc123.planningservices.a-new-council.gov.uk.",
          "target": "_def456.xyz.acm-validations.aws."
        }
      }
    ]
    ```

4. Send validation CNAME to the council

    Ask the council IT team to create this DNS record on their nameserver:

    | Type | Name | Target |
    | --- | --- | --- |
    | CNAME | `_abc123.planningservices.a-new-council.gov.uk` | `_def456.acm-validations.aws` |

    This record proves they own the domain for purposes of certificate validation. It does not affect live traffic.

    > NB. **If this is not the first domain on the shared CDN** and you want to expedite:
    > - Do steps 11-12 **now** and send the council both DNS records together.
    > - Do step 13 **now** and bundle the application-level changes into your current PR (to be merged in step 9).
  
5. **Wait** for the council to confirm they've added the record.

    If this is likely to take a while, open a PR with your initial commit and get it merged, so that the `customDomains.ts` source of truth is accurate on `main`.

    When it's done, you can then verify in the [AWS console](https://us-east-1.console.aws.amazon.com/acm/certificates/list) (make sure you're in the `us-east-1` region). The status of the specific domain on the mining cert should have changed from `Pending validation` to `Success`.

    NB. The mining certs will 'fail' after 72hrs of attempting to validate their assigned domains, in which case you cannot use it to verify a correct DNS record. However, they can be re-created by simply deploying `certificates` again, as in step 2. Note that when these certs fail, Pulumi loses track of them, so it will not clean them up on next deploy (i.e. we should do that manually).

6. Advance the state of the domain to `shared-final` by updating the entry in `customDomains.ts`:

    ```diff
    - cloudFrontState: "validation-only",
    + cloudFrontState: "shared-final",
    ```

    Commit this change, open a PR if you haven't already, and get the PR approved.

7. Deploy `certificates` again (as in step 2).

    This deploy removes the domain from the mining cert and adds it to the shared cert proper. It does this by creating a new cert, but we **retain the old cert**, because for now the shared CDN still relies on it.

8.  Before we proceed, we need to **verify the new certificate has issued**.

    **This will fail** if the council we are onboarding has not yet added the DNS validation record (which we should have already verified in step 5) - or if _any other council_ already using the shared CDN has removed their validation record since the last time the shared cert was replaced.

    First get the ID of the new cert:

    ```sh
    cd infrastructure/certificates
    pulumi stack output customDomainsCertArn --stack production
    ```

    This returns a value like `arn:aws:acm:us-east-1:123:certificate/[uuid]`. The cert ID is the UUID after the slash.

    You can then check the [AWS console](https://us-east-1.console.aws.amazon.com/acm/certificates/list) (in the `us-east-1` region). The relevant cert should have status `Issued`. If not, identify which domain is not validated by clicking through on the cert ID, and contact that council to resolve.
    
    Note that at this point, the cert should display as **not** in use, because it's not yet attached to a CloudFront distribution.

9. Now **merge your PR to `main`** and **deploy your changes to `production`** to deploy the `application` layer via CI.

    This deploy attaches the new cert to the shared CDN (and will also create it first, if it doesn't already exist).

10. Clean up the old shared cert with another run of `certificates`.

    NB. This may not work. Pulumi seems to keep track of the retained cert in some cases and not others. If the `pulumi up` run does not propose any changes, you can do this manually in the [AWS console](https://us-east-1.console.aws.amazon.com/acm/certificates/list?region=us-east-1#) instead. It's essentially harmless for these old shared certs to build up, but also confusing!

11. Get the shared CDN domain name:

    ```sh
    cd infrastructure/application
    pulumi stack output customDomainsCdnDomainName --stack production
    ```

    This returns a value like `d1234abcd.cloudfront.net`.

12. Send CloudFront CNAME to the council, i.e. ask them to create a second DNS record:

    | Type | Name | Target |
    | --- | --- | --- |
    | CNAME | `planningservices.a-new-council.gov.uk` | `d1234abcd.cloudfront.net` |

    As soon as this propagates, live traffic to the custom domain will be routed to the shared CloudFront PlanX distribution.

13. Application-level configuration should be included in the same PR or as a follow-up:

    1. **Frontend route detection** — add the domain to `PREVIEW_ONLY_DOMAINS` in `apps/editor.planx.uk/src/utils/routeUtils/utils.ts`

    2. **Error reporting** — add a `case` for the domain in `getEnvForAllowedHosts()` in `apps/editor.planx.uk/src/airbrake.ts`, mapping to `"production"`

    3. **Database** — set `team.domain` to `planningservices.a-new-council.gov.uk` in the Hasura production console (this enables payment links and save-and-return URLs to use the custom domain)

14. Implement monitoring as needed.

    *If* there are fewer than 5 monitors under the `custom-domains-production` tab on [UptimeRobot](https://dashboard.uptimerobot.com/monitors), then add this new domain by cloning one of the existing monitors (to preserve integrations e.g. Slack alerts for SSL expiry)

    > **Note:** We share a single UptimeRobot login stored in the 1Password 'PlanX' vault. You may need to ask someone with access to do this step.

15. Update the [PlanX CRM on Notion](https://www.notion.so/opensystemslab/Plan-CRM-27c35d469ad1806c8f4dd95067ccf4ff).

    Find the relevant council's page in our internal CRM, and do the following:
    - Add the domain as it appears in our single source of truth (`customDomains.ts`) under the field 'Custom Subdomain'.


### B. Migrating a council from legacy setup

Path: `legacy-with-validation` → `cutover-ongoing`  → `shared-final`

Here we migrate a council from their own dedicated CloudFront distribution (backed by an SSL certificate they provided us) to the shared CloudFront distribution (backed by a DNS-validated ACM certificate which we provision ourselves).

The usual prompt for this process will be an impending expiry of a council's SSL cert, as flagged in the `#planx-notifications-ssl` Slack channel. You can check these dates at source in the [AWS console](https://us-east-1.console.aws.amazon.com/acm/certificates/list?region=us-east-1).

NB. No new councils will be onboarded in the legacy mode, so when we migrate the last council, we can revise our documentation (i.e. delete this section).

1. Do steps 3-5 from [flow A](#a-onboarding-a-new-council) (i.e. send the DNS validation record to the council).

    > NB. **If this is not the first domain on the shared CDN** and you want to expedite:
    > - Do steps 4-5 **now** and send the council both DNS records together (you still have to wait for them to add the records before proceeding to step 2).

2. Advance the domain in question to the `cutover-ongoing` state by updating `customDomains.ts`:

    ```diff
    - cloudFrontState: "legacy-with-validation",
    + cloudFrontState: "cutover-ongoing",
    ```

    Commit this, open a PR and get it approved.

3. Do steps 7-10 from [flow A](#a-onboarding-a-new-council) (i.e. initialise a new shared cert and attach the shared CDN to it).

4. Get the shared distribution domain name and ID:

    ```sh
    cd infrastructure/application
    pulumi stack output customDomainsCdnDomainName --stack production
    pulumi stack output customDomainsDistributionId --stack production
    ```

    This should return values like `d1234abcd.cloudfront.net` and `E1234ABCD56YZ` respectively.

5. Ask the council to switch their DNS target for the domain.

    That is, they will need to update their existing CNAME record to point at the shared CloudFront domain (replacing the old per-domain `xyz.cloudfront.net` value).

    | Type | Name | Target |
    | --- | --- | --- |
    | CNAME | `planningservices.an-existing-council.gov.uk` | `d1234abcd.cloudfront.net` |

6. **Wait** for the council to confirm they've added the record.

    Because of the way CloudFront works, traffic redirected to the domain name of the shared CloudFront distribution will still be directed to the legacy distribution by AWS (until we do the next step). See [Appendix B](#appendix-b-cloudfront-routing)) for a more thorough explanation!
    
7. Run the AWS `update-domain-association` [command](https://docs.aws.amazon.com/cli/latest/reference/cloudfront/update-domain-association.html) from your terminal to move the domain (known as an 'alias' in the context of CloudFront) from the legacy distribution to the shared distribution ([docs](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/alternate-domain-names-move.html)).

    If you haven't used the AWS CLI from your terminal before, set that up first (see `../how-to-setup-aws-sso-credentials.md`). CloudFront distributions are global so the AWS region isn't important here.

    We have to provide the domain we're migrating, the ID of the shared CloudFront distribution, and it's 'eTag' ([entity tag](https://docs.aws.amazon.com/sdk-for-swift/latest/api/awss3/documentation/awss3/s3clienttypes/object/etag/)). So first, we get the eTag for the shared CDN:

    ```sh
    aws cloudfront get-distribution \
      --id E1234ABCD56YZ \
      --query ETag \
      --output text
    ```

    This should return a value like `E9876WXYZ12ABC`. Make sure to do this anew every time, since it's a hash of the object and will change.

    Finally we can run the command to move the alias, supplying the eTag to the `--if-match` option:

    ```sh
    aws cloudfront update-domain-association \
      --domain planningservices.an-existing-council.gov.uk \
      --target-resource DistributionId=E1234ABCD56YZ \
      --if-match E9876WXYZ12ABC
    ```

    If successful, this operation should return some json with the new `ETag` value. You can confirm in the [AWS console](https://us-east-1.console.aws.amazon.com/cloudfront/v4/home?region=us-east-1#/distributions) (check the _Alternate domain names_ column).

    > **Warning**: As soon as you execute this step, you need to run through at least steps 8-10 immediately thereafter (or at the very least, before another production deploy can occur with the domain still in `cutover-ongoing` state).

8. Verify traffic has been re-routed:

    ```sh
    dig planningservices.an-existing-council.gov.uk CNAME +short
    ```

    This should return the shared CDN name like `d1234abcd.cloudfront.net`.

    It's also worth visiting the site in the browser and checking it works as expected.

9. Finally, advance the domain to `shared-final`:

    ```diff
    - cloudFrontState: "single-plus-shared",
    + cloudFrontState: "shared-final",
    ```

    If the entry has `certificateLocation`, remove it — it's only used by the legacy CDN:

    ```diff
    - certificateLocation: "pulumiConfig",
    ```

    Once again, commit these changes and open a PR.

10. Deploy the `application` layer by merging said PR and rolling it out to prod.

    This deploy tears down the legacy CloudFront distribution, which is now redundant because we have re-routed traffic to the shared distribution by virtue of the council swapping out the DNS record, and us then moving the alias across. It will also destroy the legacy (imported) cert with which the distribution was associated.

    NB. Application-level config (see step 13 in [flow A](#a-onboarding-a-new-council)) is already in place for legacy councils, so no changes are needed in that regard.

11. Clean up BYO certificate artefacts. Depending on where the old certificate was stored...

    - **AWS Secrets Manager** - delete the `ssl/[team]` secret in the [AWS console](https://eu-west-2.console.aws.amazon.com/secretsmanager/listsecrets?region=eu-west-2#) (you may only be able to _schedule_ the deletion)
    - **Pulumi config** - remove secrets via the terminal:

      ```sh
      cd infrastructure/application
      pulumi config rm ssl-<team>-key --stack production
      pulumi config rm ssl-<team>-cert --stack production
      pulumi config rm ssl-<team>-chain --stack production
      ```

14. Implement monitoring as needed.

    *If* there are more than 5 monitors under the `custom-domains-production` tab on [UptimeRobot](https://dashboard.uptimerobot.com/monitors), then delete the monitor for the domain you just migrated (we only maintain a few as canaries). Otherwise, do nothing.

    > **Note:** We share a single UptimeRobot login stored in the 1Password 'PlanX' vault. You may need to ask someone with access to do this step.

15. Update the [PlanX CRM on Notion](https://www.notion.so/opensystemslab/Plan-CRM-27c35d469ad1806c8f4dd95067ccf4ff).

    Find the relevant council's page in our internal CRM, and do the following:
    - Remove the date from the field 'SSL Expiry Date'.
    - Add the domain as it appears in our single source of truth (`customDomains.ts`) under the field 'Custom Subdomain'.


## Appendix A. Automatic certificate renewal

DNS-validated ACM certificates are managed entirely by AWS and **renew automatically** as long as the validation CNAME record remains in the council's DNS. There is no need for any manual intervention once the `shared-final` state has been achieved.

For legacy councils still on BYO certificate (`legacy-with-validation`), the preferred path is to **migrate them to the shared CDN** as above, rather than renewing the BYO certificate.

If you must do the latter, you can find the old howto [here](https://github.com/theopensystemslab/planx-new/blob/356d052450ff24485a90df45b2741614418ccc38/doc/how-to/how-to-setup-custom-subdomains.md).


## Appendix B. CloudFront routing

There are some nuances to the way that CloudFront works which are useful to understand when reasoning about it, not all of which are immediately obvious from the [AWS docs](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Introduction.html):

- Aliases (read: domains) are unique across CloudFront distributions globally. That is, no two distributions can be associated with the same alias. Attempting to do so throws a `CNAMEAlreadyExists` error.
- CloudFront domain names in the same AWS account are essentially interchangeable. They act as 'gateways' to the CloudFront network, but the request is handled based on the given `Host`, rather than the specific domain the request is made to.

Some corollaries relevant to our scenario follow:

- We have to move our custom domain manually between two already existing CloudFront distributions, rather than adding the alias to the shared CDN while it's still on the legacy CDN. That is, if we are creating the shared CDN for the first time, we have to spin it up as 'empty' first, rather than provisioning it immediately with the alias.
- While both CDNs are up, the council's DNS `CNAME` record can point at _either_ of them, as long as both are attached to a certificate which includes the custom domain in question. CloudFront will serve the request regardless. That is, once the correct certs are in place, the order in which the alias is moved and the DNS record is replaced is unimportant!


## Troubleshooting

### Councils need two CNAME records

New councils must add **two** DNS records in total:

1. An ACM validation CNAME (proves domain ownership, enables certificate issuance)
2. A CloudFront routing CNAME (directs live traffic to CDN, which serves PlanX)

These are independent — the first can be added long before the second. They both need to maintained indefinitely.
