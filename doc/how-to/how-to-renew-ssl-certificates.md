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

5. **PlanX** - Update certificates on AWS infrastructure (production)
   
    The following variables will need to be updated for the team - 
    - `ssl-{team}-key`
    - `ssl-{team}-cert`
    - `ssl-{team}-chain`

6. **PlanX** - Add certificate expiry date to [PlanX CMS on Notion](https://www.notion.so/opensystemslab/Plan-Customers-dee2cdfb40c04b5fa88edc5a86989211)