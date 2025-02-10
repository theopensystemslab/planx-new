# How to setup "Reply-to email addresses" in GOV.UK Notify

## Overview

This guide outlines the process of setting up the "Reply-to email addresses" for a team in GOV.UK Notify and configuring this in the PlanX database. This field is required by the Notify client, and is used to set the `Reply-To` header on emails we send. This means that when an email is received by applicants, hitting "reply" in their email clients will direct them to the correct team.

By default, we use UUID for the `devops+govuknotify@opensystemslab.io` email address when creating a new team. This is used as we do not know the correct destination email when creating a team, and the team may initially be using PlanX for guidance services only.

Setting this email address up is a pre-requisite for a team going live with submission services. If we do not complete this step, applicants may contact OSL directly instead of the correct council officers.


## Process

1. Log into GOV.UK Notify (https://www.notifications.service.gov.uk/)
2. Navigate to Settings > Reply-to email addresses
3. Add the council's email address
4. Once verified, copy the generated UUID
5. Populate the `team_settings.email_reply_to_id` column (via Hasura) with this UUID