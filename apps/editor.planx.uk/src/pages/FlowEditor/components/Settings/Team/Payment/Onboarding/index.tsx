import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import React, { useState } from "react";
import InputLegend from "ui/editor/InputLegend";
import NewSettingsSection from "ui/editor/NewSettingsSection";
import SettingsDescription from "ui/editor/SettingsDescription";

type OnboardingStatus = "notStarted" | "connecting" | "connected";

/**
 * Rough approximation of details we may want to show
 * Docs: https://docs.stripe.com/api/accounts/object
 */
interface ConnectedAccount {
  accountId: string;
  businessName: string;
  email: string;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
}

const PLACEHOLDER_ACCOUNT: ConnectedAccount = {
  accountId: "acct_1234567890",
  businessName: "Example Council",
  email: "payments@example.council.gov.uk",
  chargesEnabled: true,
  payoutsEnabled: true,
};

/**
 * Placeholder — simulates the Stripe Connect OAuth redirect flow
 * @todo Replace with real Stripe Connect onboarding
 */
const connectToStripe = async (): Promise<ConnectedAccount> => {
  console.log("[Onboarding] Starting Stripe Connect onboarding...");
  console.log("[Onboarding] Redirecting to Stripe Connect OAuth...");
  await new Promise((resolve) => setTimeout(resolve, 2000));
  console.log("[Onboarding] Stripe Connect account linked successfully");
  return PLACEHOLDER_ACCOUNT;
};

const Onboarding: React.FC = () => {
  const [status, setStatus] = useState<OnboardingStatus>("notStarted");
  const [account, setAccount] = useState<ConnectedAccount | null>(null);

  const handleConnect = async () => {
    setStatus("connecting");
    const connectedAccount = await connectToStripe();
    setAccount(connectedAccount);
    setStatus("connected");
  };

  return (
    <NewSettingsSection>
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 4 }}>
          <InputLegend gutterBottom>Stripe onboarding</InputLegend>
          <SettingsDescription>
            <p>
              To process payments through Stripe, your team needs to connect a
              Stripe account. This uses{" "}
              <Link
                href="https://docs.stripe.com/connect"
                target="_blank"
                rel="noopener noreferrer"
              >
                Stripe Connect
              </Link>{" "}
              to securely link your account without sharing credentials.
            </p>
            <p>
              Once connected, Stripe will handle payment processing for all
              application fees collected through your services.
            </p>
            <p>
              <Link href="#" target="_blank" rel="noopener noreferrer">
                Read our full onboarding guide (TODO)
              </Link>
            </p>
          </SettingsDescription>
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              paddingTop: 0.25,
            }}
          >
            {status === "notStarted" && (
              <>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  No Stripe account connected. Click below to start the
                  onboarding process.
                </Typography>
                <Box>
                  <Button onClick={handleConnect} variant="contained">
                    Connect Stripe account
                  </Button>
                </Box>
              </>
            )}

            {status === "connecting" && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <CircularProgress size={20} />
                <Typography variant="body2">Connecting to Stripe...</Typography>
              </Box>
            )}

            {status === "connected" && account && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Typography variant="body1">Status:</Typography>
                  <Chip label="Connected" color="success" size="small" />
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Account ID
                  </Typography>
                  <Typography variant="body1">{account.accountId}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Business name
                  </Typography>
                  <Typography variant="body1">
                    {account.businessName}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Email
                  </Typography>
                  <Typography variant="body1">{account.email}</Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
                  <Chip
                    label="Charges enabled"
                    color={account.chargesEnabled ? "success" : "warning"}
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    label="Payouts enabled"
                    color={account.payoutsEnabled ? "success" : "warning"}
                    size="small"
                    variant="outlined"
                  />
                </Box>
              </Box>
            )}
          </Box>
        </Grid>
      </Grid>
    </NewSettingsSection>
  );
};

export default Onboarding;
