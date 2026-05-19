# How to setup custom domains

## Context 🖼️

Teams can access PlanX via a custom subdomain on their own domain (e.g. `https://planningservices.medway.gov.uk/`).

Custom domains are ideally served by a **shared CloudFront distribution** backed by a single DNS-validated ACM certificate (which we abbreviate as 'cert' hereafter). This replaces the legacy model where each council's custom domain had its own dedicated CloudFront distribution and had to provide us with an SSL cert.

Because the cert is DNS-validated and managed by AWS, **SSL certs auto-renew** — there is no manual renewal process. All that is required of council IT teams is for them to add 2 DNS records (possibly at different times).

### Source of truth

All custom domains are defined in [`infrastructure/common/customDomains.ts`](../../infrastructure/common/customDomains.ts). Each entry has a `cloudFrontState` string describing where it is in the lifecycle:

| `cloudFrontState` | Actual state of infrastructure |
| --- | --- |
| `validation-only` | Domain is not associated with any CDN, but is on the "mining" certificate (cert) to surface DNS validation records (which we will send to council). |
| `legacy-with-validation` | Domain is associated with (i.e. is an alias of) legacy CDN, which is backed by a council-provided cert. Domain is also on mining cert. |
| `cutover-init` | Domain is still associated with legacy CDN, but shared CDN also certainly exists, and is backed by a shared cert provisioned by us, which includes the domain as an [SAN](https://support.dnsimple.com/articles/what-is-ssl-san/).
| `cutover-ongoing` | Domain is now associated with the shared CDN, by virtue of us having run `associate-alias` to manually transfer it. The legacy CDN still exists but has no aliases.
| `shared-final` | Domain is associated with shared CDN. The legacy CDN, if this was a migration, has been torn down (otherwise, it never existed). This will be the eventual final state for all domains. |

NB. We largely use 'CDN' and '[CloudFront] distribution' interchangeably although this is a simplification.

### Deploy ordering

Correct sequencing is important! Usually, the `certificates` stack must be deployed (manually) _before_ the `application` stack, for example because it exports the shared certificate ARN via a Pulumi stack reference.

However, there is nuance here. When it comes to tearing down legacy CloudFront distributions, we have to delete those first (i.e. deploy `application`) _before_ we delete the attached cert (i.e. deploy `certificates`.)

- **Certificates** — manually deployed (see `infrastructure/README.md`)
- **Application** — deployed by CI on every merge to `main` (staging) or on  `production` rollout


## Process ⚙️

There are two paths here. You are either (a) onboarding a new council who have no existing custom domain, or (b) migrating a council with an existing custom domain from the legacy infrastructure setup to the new, shared CDN setup.

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
    > - Do steps 8-10 **now**
    > - Send the council both DNS records together
    > - Bundle the application-level changes into your current PR (to be merged in step 7).
  
5. **Wait** for the council to confirm they've added the record.

    If this is likely to take a while, open a PR with your initial commit and get it merged, so that the `customDomains.ts` source of truth is accurate on `main`.

    When it's done, you can then verify in the [AWS console](https://us-east-1.console.aws.amazon.com/acm/certificates/list) (make sure you're in the `us-east-1` region). The status of the specific domain on the mining cert should have changed from `Pending validation` to `Success`.

6. Advance the state of the domain to `shared-final` by updating the entry in `customDomains.ts`:

    ```diff
    - cloudFrontState: "validation-only",
    + cloudFrontState: "shared-final",
    ```

    Commit this change, open a PR if you haven't already, and get the PR approved.

7. Deploy `certificates` again (as in step 2), **merge your PR to `main`**, and finally **deploy your changes to `production`** to deploy the `application` layer via CI.

    - The `certificates` deploy removes the domain from the mining cert and adds it to the shared cert proper.
    - The `application` deploy adds the domain as an alias on the shared CloudFront distribution (or creates it if it doesn't exist yet).

8. Get the shared CDN domain name:

    ```sh
    cd infrastructure/application
    pulumi stack output customDomainsCdnDomainName --stack production
    ```

    This returns a value like `d1234abcd.cloudfront.net`.

9. Send CloudFront CNAME to the council, i.e. ask them to create a second DNS record:

    | Type | Name | Target |
    | --- | --- | --- |
    | CNAME | `planningservices.a-new-council.gov.uk` | `d1234abcd.cloudfront.net` |

    As soon as this propagates, live traffic to the custom domain will be routed to the shared CloudFront PlanX distribution.

10. Application-level configuration should be included in the same PR or as a follow-up:

    1. **Frontend route detection** — add the domain to `PREVIEW_ONLY_DOMAINS` in `apps/editor.planx.uk/src/utils/routeUtils/utils.ts`

    2. **Error reporting** — add a `case` for the domain in `getEnvForAllowedHosts()` in `apps/editor.planx.uk/src/airbrake.ts`, mapping to `"production"`

    3. **Database** — set `team.domain` to `planningservices.a-new-council.gov.uk` in the Hasura production console (this enables payment links and save-and-return URLs to use the custom domain)

11. Monitoring

- Add the domain to [UptimeRobot](https://dashboard.uptimerobot.com/monitors) — clone an existing custom domain monitor to preserve integrations (e.g. Slack alerts for SSL expiry)
- Update the [PlanX CRM on Notion](https://www.notion.so/opensystemslab/Plan-CRM-27c35d469ad1806c8f4dd95067ccf4ff)

> **Note:** We share a single UptimeRobot login stored in the 1Password 'PlanX' vault. You may need to ask someone with access to do this step.

### B. Migrating a council from legacy setup

Path: `legacy-with-validation` → `cutover-init` → `cutover-ongoing`  → `shared-final`

Here we migrate a council from their own dedicated CloudFront distribution (backed by an SSL certificate they provided us) to the shared CloudFront distribution (backed by a DNS-validated ACM certificate which we provision ourselves).

The usual prompt for this process will be an impending expiry of a council's SSL cert, as flagged in the `#planx-notifications-ssl` Slack channel. You can check these dates at source in the [AWS console](https://us-east-1.console.aws.amazon.com/acm/certificates/list?region=us-east-1).

NB. No new councils will be onboarded in the legacy mode, so when we migrate the last council, we can revise our documentation (i.e. delete this section).

1. Do steps 3-5 from flow A.

    > NB. **If this is not the first domain on the shared CDN** and you want to expedite:
    > - Skip the production deploy in step 3 (**TODO**: does this make sense?)
    > - Send the council both DNS records together

2. Advance the domain in question to the `cutover-init` state by updating `customDomains.ts`:

    ```diff
    - cloudFrontState: "legacy-with-validation",
    + cloudFrontState: "cutover-init",
    ```

    Commit this, open a PR and get it approved.

3. Deploy `certificates` manually:

    ```sh
    cd infrastructure/certificates
    pulumi up --refresh --stack production
    ```

    Then **merge your PR to `main`** and **deploy your changes to `production`** to deploy the `application` layer via CI.

    - The `certificates` deploy makes a new shared cert with the additional domain on it. At this point, we retain the old cert, because until the `application` deploy has run, the shared CDN still relies on it.
    - The `application` deploy attaches the new cert to the shared CDN (and will create it first, if it doesn't already exist).

    Keen observers will notice that we now have an orpaned cert which is not attached to any CDN - but we will clean that up later.

4. Get the shared CDN name:

    ```sh
    cd infrastructure/application
    pulumi stack output customDomainsCdnDomainName --stack production
    ```

    This returns a value like `d1234abcd.cloudfront.net`.

4. **TODO**: Run the `associate-alias` command from AWS CLI to move the domain from the legacy CloudFront distribution to the shared CloudFront distribution. Explain why this works.

5. **TODO**: Advance the domain to `cutover-ongoing`:

    ```diff
    - cloudFrontState: "cutover-init",
    + cloudFrontState: "cutover-ongoing",
    ```

7. Ask the council to switch their DNS target for the domain.

    That is, they will need to update their existing CNAME record to point at the shared CloudFront domain (replacing the old per-domain `xyz.cloudfront.net` value).

    | Type | Name | Target |
    | --- | --- | --- |
    | CNAME | `planningservices.an-existing-council.gov.uk` | `d1234abcd.cloudfront.net` |

8. **Wait** for the council to confirm they've added the record.

    There is no particular rush at this point, but the sooner it happens, the sooner we can clean up the legacy infra and consider this domain resolved.

9. Verify traffic has been re-routed:

    ```sh
    dig planningservices.an-existing-council.gov.uk CNAME +short
    ```

    This should return the shared CDN name like `d1234abcd.cloudfront.net`.

    **TODO**: How to read this from Pulumi (make sure exported).

    It's also worth visiting the site in the browser and checking it works as expected.

10. Finally, advance the domain to `shared-final`:

    ```diff
    - cloudFrontState: "single-plus-shared",
    + cloudFrontState: "shared-final",
    ```

    If the entry has `certificateLocation`, remove it — it's only used by the legacy CDN:

    ```diff
      name: "an-existing-council",
      domain: "planningservices.an-existing-council.gov.uk",
      cloudFrontState: "shared-final",
    - certificateLocation: "pulumiConfig",
    ```

    Once again, commit these changes and open a PR.

11. Deploy the `application` layer by merging said PR and rolling it out to prod, then deploy `certificates` (as in step 2).

    - The `application` deploy tears down the legacy CloudFront distribution, which is now redundant because we have re-routed traffic to the shared distribution by swapping out the DNS record.
    - The `certificates` deploy then tears down the legacy cert which was attached to said CloudFront distribution.

    NB. Application-level config (see step 10 in flow A) is already in place for legacy councils, so no changes are needed in that regard.

12. Clean up BYO certificate artefacts. Depending on where the old certificate was stored...

    - **AWS Secrets Manager** - delete the `ssl/<team>` secret in the AWS Console
    - **Pulumi config** - remove secrets via the terminal:

      ```sh
      cd infrastructure/application
      pulumi config rm ssl-<team>-key --stack production
      pulumi config rm ssl-<team>-cert --stack production
      pulumi config rm ssl-<team>-chain --stack production
      ```


## Automatic certificate renewal

DNS-validated ACM certificates are managed entirely by AWS and **renew automatically** as long as the validation CNAME record remains in the council's DNS. There is no need for any manual intervention once the `shared-final` state has been achieved.

For legacy councils still on BYO certificate (`legacy-with-validation`), the preferred path is to **migrate them to the shared CDN** as above, rather than renewing the BYO certificate.


## Troubleshooting

### Councils need two CNAME records

New councils must add **two** DNS records in total:

1. An ACM validation CNAME (proves domain ownership, enables certificate issuance)
2. A CloudFront routing CNAME (directs live traffic to CDN, which serves PlanX)

These are independent — the first can be added long before the second.

### The `customDomainsCdnDomainName` output is missing

This output only exists when there is at least one domain in the `cutover-init`, `cutover-ongoing` or `shared-final` state, i.e. if the shared CDN hasn't been created yet.

### Deploy failed with "customDomainsCertArn not found"

The `application` stack depends on the `certificates` stack. That is, you have to deploy `certificates` first:

```sh
cd infrastructure/certificates && pulumi up --refresh --stack production
```
