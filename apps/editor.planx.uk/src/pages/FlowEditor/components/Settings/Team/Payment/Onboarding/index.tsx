import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import type { StripeConnectStatus } from "lib/api/stripe/types";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import InputLegend from "ui/editor/InputLegend";
import NewSettingsSection from "ui/editor/NewSettingsSection";
import SettingsDescription from "ui/editor/SettingsDescription";

import { ACCOUNT_STATUS_DISPLAY } from "./constants";
import { useRedirectToStripe } from "./hooks/useRedirectToStripe";
import { useStripeConnectStatus } from "./hooks/useStripeConnectStatus";

const getStripeDashboardUrl = (
  accountId: string | null,
  mode: StripeConnectStatus["mode"],
) => {
  const base = accountId
    ? `https://dashboard.stripe.com/${accountId}`
    : "https://dashboard.stripe.com";
  return mode === "test" ? `${base}/test/dashboard` : `${base}/dashboard`;
};

export const Onboarding: React.FC = () => {
  const teamSlug = useStore((state) => state.teamSlug);

  const { data, isLoading } = useStripeConnectStatus(teamSlug);
  const { isRedirecting, redirectToStripe } = useRedirectToStripe();
  const accountStatus =
    data?.accountStatus && ACCOUNT_STATUS_DISPLAY[data.accountStatus];

  const handleConnect = () => redirectToStripe();

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
            {isLoading && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <CircularProgress size={20} />
                <Typography variant="body2">
                  Checking connection status...
                </Typography>
              </Box>
            )}

            {isRedirecting && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <CircularProgress size={20} />
                <Typography variant="body2">
                  {data?.mode === "test"
                    ? "Setting up your test Stripe account..."
                    : "Redirecting to Stripe..."}
                </Typography>
              </Box>
            )}

            {!isLoading && !isRedirecting && !data?.connected && (
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

            {!isLoading && data?.connected && accountStatus && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Typography variant="body1">Status:</Typography>
                  <Chip
                    label={accountStatus.label}
                    color={accountStatus.color}
                    size="small"
                  />
                </Box>
                {accountStatus.description && (
                  <Typography variant="body2">
                    {accountStatus.description}
                  </Typography>
                )}
                <Box>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Account ID
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="body1">{data.accountId}</Typography>
                    <Chip
                      label={data.mode === "live" ? "Live" : "Test"}
                      color={data.mode === "live" ? "success" : "warning"}
                      size="small"
                    />
                  </Box>
                </Box>
                {data.accountStatus === "unavailable" ? (
                  !isRedirecting && (
                    <Box>
                      <Button onClick={handleConnect} variant="contained">
                        Connect Stripe account
                      </Button>
                    </Box>
                  )
                ) : (
                  <Box>
                    <Link
                      href={getStripeDashboardUrl(data.accountId, data.mode)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {data.accountStatus === "incomplete"
                        ? "Finish setup in the Stripe dashboard (opens in a new tab)"
                        : "Open Stripe dashboard (opens in a new tab)"}
                    </Link>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </Grid>
      </Grid>
    </NewSettingsSection>
  );
};

export default Onboarding;
