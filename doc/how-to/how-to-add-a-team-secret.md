# How to add a team secret
This document describes our processes for adding a new team secret to the PlanX application, e.g. Gov Pay API keys.

This guide will demonstrate how to - 
 - Encrypt a secret
 - Store the encrypted secret in our database
 - Verify that the encrypted secret matches the decrypted/raw version

## Process

### Obtain the secret
1. Get the raw secret, e.g. you might have been sent it in an email from a council officer.

### Get the encryption key
1. In `/infrastructure/application`, run `pulumi config get encryption-key --stack production`.
2. This should output the encryption key in the terminal.

### Encrypt the secret
1. In `/scripts/encrypt`, run the encryption script using the encryption key and raw secret that you obtained in the previous steps: `pnpm encrypt <encryption-key> <secret>`.
2. This should output the encrypted secret in the terminal.
3. It is useful to double check that the encryption was successful by running the decryption script and checking you get the same secret back: `pnpm decrypt <encryption-key> <encrypted_secret>`.

### Update the database with the encrypted secret
1. Go to our [production Hasura instance](hasura.editor.planx.uk).
2. In the `team_integrations` table, find the row for the relevant team and paste the encrypted secret into the correct field (e.g. `production_govpay_secret`). 
3. Press save!

### Test

You should now prompt the team representative (e.g. council officer) to test that the secret has been successfully updated, e.g. test a flow with GovPay.
