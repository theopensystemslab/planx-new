import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import React, { type FormEvent, useState } from "react";
import InputLabel from "ui/editor/InputLabel";
import InputLegend from "ui/editor/InputLegend";
import NewSettingsSection from "ui/editor/NewSettingsSection";
import SettingsDescription from "ui/editor/SettingsDescription";
import Input from "ui/shared/Input/Input";

import { useRedirectToStripe } from "../Onboarding/hooks/useRedirectToStripe";

const MAX_NAME_LENGTH = 100;

const validateName = (name: string, existingNames: string[]) => {
  if (!name) return "Enter a name for the account";
  if (name.length > MAX_NAME_LENGTH) {
    return `Account name must be ${MAX_NAME_LENGTH} characters or fewer`;
  }

  const isTaken = existingNames.some(
    (existing) => existing.toLowerCase() === name.toLowerCase(),
  );
  if (isTaken) return `There's already an account called ${name}`;
};

interface ConnectAccountProps {
  existingNames: string[];
}

/**
 * For a team with multiple Stripe accounts, connect another account under a name the user chooses
 */
export const ConnectAccount: React.FC<ConnectAccountProps> = ({
  existingNames,
}) => {
  const { isRedirecting, redirectToStripe } = useRedirectToStripe();
  const [name, setName] = useState("");
  const [error, setError] = useState<string>();

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    const trimmedName = name.trim();
    const validationError = validateName(trimmedName, existingNames);
    setError(validationError);

    if (!validationError) redirectToStripe(trimmedName);
  };

  return (
    <NewSettingsSection>
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 4 }}>
          <InputLegend gutterBottom>Connect a Stripe account</InputLegend>
          <SettingsDescription>
            <p>
              Payments are paid into the account named after the site's local
              authority district, e.g. "Worthing".
            </p>
            <p>The name can't be changed once the account is connected.</p>
          </SettingsDescription>
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          {isRedirecting ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <CircularProgress size={20} />
              <Typography variant="body2">Redirecting to Stripe...</Typography>
            </Box>
          ) : (
            <Box
              component="form"
              onSubmit={handleSubmit}
              noValidate
              sx={{ display: "flex", flexDirection: "column", gap: 2 }}
            >
              <InputLabel label="Account name" htmlFor="stripeAccountName">
                <Input
                  name="stripeAccountName"
                  id="stripeAccountName"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  errorMessage={error}
                />
              </InputLabel>
              <Box>
                <Button type="submit" variant="contained">
                  Connect Stripe account
                </Button>
              </Box>
            </Box>
          )}
        </Grid>
      </Grid>
    </NewSettingsSection>
  );
};

export default ConnectAccount;
