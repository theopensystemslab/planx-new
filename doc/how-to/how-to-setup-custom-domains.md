# How to setup custom domains

## Context 🖼️

Teams can access PlanX via a custom subdomain on their own domain (e.g. `https://planningservices.medway.gov.uk/`).

Custom domains are served by a **shared CloudFront distribution** backed by a single DNS-validated ACM certificate. This replaces the legacy model where each council had its own CloudFront distribution and had to provide us with an SSL certificate ('BYO cert').

Because the certificate is DNS-validated and managed by AWS, **SSL certificates auto-renew** — there is no manual renewal process. All that is required of councils is for them to add 2 DNS records.

### Source of truth

All custom domains are defined in [`infrastructure/common/customDomains.ts`](../../infrastructure/common/customDomains.ts). Each entry has a `cloudFrontState` string describing where it is in the lifecycle:

| State | Meaning |
| --- | --- |
| `validation-only` | No CDN. Domain is on the "mining" cert to surface DNS validation records. |
| `single-plus-validation` | Legacy per-domain CDN is live. Domain is also on mining cert. |
| `single-plus-shared` | Legacy CDN + shared CDN both live and running in parallel (during cutover). |
| `shared-only` | Shared CDN is live. This will be the eventual final state for all domains. |

### Deploy ordering

The `certificates` stack must always be deployed (manually) **before** the `application` stack. The application stack reads the shared certificate ARN from the certificates stack via a Pulumi stack reference.

- **Certificates** — manually deployed (see `infrastructure/README.md`)
- **Application** — deployed by CI on every merge to `main` (staging) or `production` rollout


## Process ⚙️

There are two paths here. You are either (a) onboarding a new council who have no existing custom domain, or (b) migrating a council with an existing custom domain from the legacy infrastructure setup to the new, shared CDN setup.

In either case, please read through all the steps before starting, for best results.


### a. Onboarding a new council

Path: `validation-only` → `shared-only`

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

    This record proves they own the domain. It does not affect any live traffic.

    > NB. If you want to expedite this process and this is not the first council on the shared CDN setup, you can also do steps 8-10 now, i.e. **send the council both DNS records together**, and **bundle the application-level changes into your current PR** (to be merged in step 7).
  
5. **Wait** for the council to confirm they've added the record.

    If this is likely to take a while, open a PR with your initial commit and get it merged, so that the `customDomains.ts` source of truth is accurate on `main`.

    When it's done, you can then verify in the [AWS console](https://us-east-1.console.aws.amazon.com/acm/certificates/list) (make sure you're in the `us-east-1` region). The status of the specific domain on the mining cert should have changed from `Pending validation` to `Success`.

6. Advance the state of the domain to `shared-only` by updating the entry in `customDomains.ts`:

    ```diff
    - cloudFrontState: "validation-only",
    + cloudFrontState: "shared-only",
    ```

    Commit this change, open a PR if you haven't already, and get the PR approved.

7. Deploy `certificates` again (as in step 2), then **merge your PR** to deploy the `application` layer and update the source of truth on `main`.

    - The `certificates` deploy moves the domain from the mining cert to the shared cert proper.
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

10. Application-level configuration. These changes should be included in the same PR or as a follow-up:

    1. **Frontend route detection** — add the domain to `PREVIEW_ONLY_DOMAINS` in `apps/editor.planx.uk/src/utils/routeUtils/utils.ts`

    2. **Error reporting** — add a `case` for the domain in `getEnvForAllowedHosts()` in `apps/editor.planx.uk/src/airbrake.ts`, mapping to `"production"`

    3. **Database** — set `team.domain` to `planningservices.a-new-council.gov.uk` in the Hasura production console (this enables payment links and save-and-return URLs to use the custom domain)

11. Monitoring

- Add the domain to [UptimeRobot](https://dashboard.uptimerobot.com/monitors) — clone an existing custom domain monitor to preserve integrations (e.g. Slack alerts for SSL expiry)
- Update the [PlanX CRM on Notion](https://www.notion.so/opensystemslab/Plan-CRM-27c35d469ad1806c8f4dd95067ccf4ff)

> **Note:** We share a single UptimeRobot login stored in the 1Password 'PlanX' vault. You may need to ask someone with access to do this step.

### b. Migrating a council from legacy setup

Path: `single-plus-validation` → `single-plus-shared` → `shared-only`

Here we migrate a council from their own, already existing CloudFront distribution (backed by a council-provided SSL certificate) to the shared CloudFront distribution (backed by a DNS-validated ACM certificate which we provision ourselves).

The usual prompt for this process will be an impending expiry of a council's SSL cert, as flagged in the `#planx-notifications-ssl` Slack channel.

NB. No new councils will be onboarded in the legacy mode, so when we migrate the last council, we can revise our documentation (i.e. delete this section).

1. Advance the domain in question to the `single-plus-shared` state. Update the entry in `customDomains.ts`:

    ```diff
    - cloudFrontState: "single-plus-validation",
    + cloudFrontState: "single-plus-shared",
    ```

    Commit this, open a PR and get it approved.

2. Deploy `certificates`:

    ```sh
    cd infrastructure/certificates
    pulumi up --refresh --stack production
    ```

    Then **merge your PR** to deploy the `application` layer and update the source of truth on `main`.

    This adds the domain to the shared cert and shared CDN **while keeping the legacy per-domain CDN running**. Both CDNs serve traffic — which one the user hits depends on where the council's DNS points.

3. Get the shared CDN name:

    ```sh
    cd infrastructure/application
    pulumi stack output customDomainsCdnDomainName --stack production
    ```

    This returns a value like `d1234abcd.cloudfront.net`.

4. Ask the council to switch their DNS target for the domain.

    That is, they will need to update their existing CNAME record to point at the shared CloudFront domain (replacing the old per-domain `xyz.cloudfront.net` value).

    | Type | Name | Target |
    | --- | --- | --- |
    | CNAME | `planningservices.an-existing-council.gov.uk` | `d1234abcd.cloudfront.net` |

5. Verify traffic has been re-routed:

    ```sh
    dig planningservices.an-existing-council.gov.uk CNAME +short
    ```

    This should return the shared CDN name like `d1234abcd.cloudfront.net`.

    It's also worth visiting the site in the browser and checking it works as expected.

6. Finally, advance the domain to `shared-only`:

    ```diff
    - cloudFrontState: "single-plus-shared",
    + cloudFrontState: "shared-only",
    ```

    If the entry has `certificateLocation`, remove it — it's only used by the legacy CDN:

    ```diff
      name: "an-existing-council",
      domain: "planningservices.an-existing-council.gov.uk",
      cloudFrontState: "shared-only",
    - certificateLocation: "pulumiConfig",
    ```

    Once again, commit these changes and open a PR.

7. Deploy the `application` layer by merging said PR.

    This tears down the legacy per-domain CloudFront distribution and its imported ACM certificate, which is now redundant because we have re-routed traffic to the shared CDN.

    NB. Application-level config (see step 10 in above flow) is already in place for legacy councils, so no changes needed in that regard.

8. Clean up BYO certificate artefacts. Depending on where the old certificate was stored...

    - **AWS Secrets Manager** - delete the `ssl/<team>` secret in the AWS Console
    - **Pulumi config** - remove secrets via the terminal:

      ```sh
      cd infrastructure/application
      pulumi config rm ssl-<team>-key --stack production
      pulumi config rm ssl-<team>-cert --stack production
      pulumi config rm ssl-<team>-chain --stack production
      ```


## Automatic certificate renewal

DNS-validated ACM certificates are managed entirely by AWS and **renew automatically** as long as the validation CNAME record remains in the council's DNS. There is no need for any manual intervention once the `shared-only` state has been achieved.

For legacy councils still on BYO certificate (`single-plus-validation`), the preferred path is to **migrate them to the shared CDN** as above, rather than renewing the BYO certificate.


## Troubleshooting

### Councils need two CNAME records

New councils must add **two** DNS records in total:

1. An ACM validation CNAME (proves domain ownership, enables certificate issuance)
2. A CloudFront routing CNAME (directs live traffic to CDN, which serves PlanX)

These are independent — the first can be added long before the second.

### The `customDomainsCdnDomainName` output is missing

This output only exists when there is at least one domain in `single-plus-shared` or `shared-only` state. If the shared CDN hasn't been created yet, the output won't appear.

### Deploy failed with "customDomainsCertArn not found"

The `application` stack depends on the `certificates` stack. That is, you have to deploy `certificates` first:

```sh
cd infrastructure/certificates && pulumi up --refresh --stack production
```
