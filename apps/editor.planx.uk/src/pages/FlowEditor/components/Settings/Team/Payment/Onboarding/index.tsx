import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useToast } from "hooks/useToast";
import { getStripeConnectStatus } from "lib/api/stripe/requests";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect } from "react";
import InputLegend from "ui/editor/InputLegend";
import NewSettingsSection from "ui/editor/NewSettingsSection";
import SettingsDescription from "ui/editor/SettingsDescription";

export const Onboarding: React.FC = () => {
  const teamSlug = useStore((state) => state.teamSlug);
  const toast = useToast();
  const navigate = useNavigate();
  const search = useSearch({ strict: false });
  const { stripeConnected, stripeError } = search;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["stripeConnectStatus", teamSlug],
    queryFn: () => getStripeConnectStatus(teamSlug),
  });

  useEffect(() => {
    if (!stripeConnected && !stripeError) return;

    if (stripeConnected) {
      toast.success("Stripe account connected successfully");
      refetch();
    } else if (stripeError) {
      toast.error(
        stripeError === "access_denied"
          ? "Stripe connection was cancelled"
          : "Failed to connect Stripe account, please try again",
      );
    }

    navigate({
      to: ".",
      search: (prev) => ({
        ...prev,
        stripeConnected: undefined,
        stripeError: undefined,
      }),
      replace: true,
    });
    // Only run once, on mount, to consume the redirect params from the URL
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleConnect = () => {
    window.location.href = `${import.meta.env.VITE_APP_API_URL}/stripe/connect/${teamSlug}`;
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

            {!isLoading && !data?.connected && (
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

            {!isLoading && data?.connected && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Typography variant="body1">Status:</Typography>
                  <Chip label="Connected" color="success" size="small" />
                </Box>
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
              </Box>
            )}
          </Box>
        </Grid>
      </Grid>
    </NewSettingsSection>
  );
};

export default Onboarding;
