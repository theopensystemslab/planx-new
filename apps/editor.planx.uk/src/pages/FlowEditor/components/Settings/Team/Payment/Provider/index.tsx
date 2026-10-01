import WarningIcon from "@mui/icons-material/Warning";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Grid from "@mui/material/Grid";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Typography from "@mui/material/Typography";
import type { TeamSettings } from "@opensystemslab/planx-core/types";
import { usePaymentProvider } from "hooks/usePaymentProvider";
import { useToast } from "hooks/useToast";
import { getStripeCanMigrate } from "lib/api/stripe/requests";
import type {
  MigrationBlocker,
  MigrationBlockerReason,
} from "lib/api/stripe/types";
import { hasFeatureFlag } from "lib/featureFlags";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useState } from "react";
import InputLegend from "ui/editor/InputLegend";
import NewSettingsSection from "ui/editor/NewSettingsSection";
import SettingsDescription from "ui/editor/SettingsDescription";
import { WarningContainer } from "ui/shared/WarningContainer/WarningContainer";

import { useStripeConnectStatus } from "../Onboarding/hooks/useStripeConnectStatus";

export type PaymentProvider = TeamSettings["paymentProvider"];

type DialogState =
  | { type: "closed" }
  | { type: "checking" }
  | { type: "blocked"; blockers: MigrationBlocker[] }
  | { type: "confirm" };

const BLOCKER_MESSAGES: Record<
  MigrationBlockerReason,
  (props: MigrationBlocker) => string
> = {
  stripeNotConnected: () => "Stripe has not been connected for this team",
  activeGovpaySessions: (props) =>
    `${props.count} active GOV.UK Pay session${props.count === 1 ? " is" : "s are"} in progress`,
  checkoutNotConfigured: () => "Stripe Checkout is not yet configured",
};

const PROVIDER_LABELS: Record<NonNullable<PaymentProvider>, string> = {
  govpay: "GOV.UK Pay",
  stripe: "Stripe",
};

const formatBlockerList = (blockers: MigrationBlocker[]): string => {
  const messages = blockers.map((b) => BLOCKER_MESSAGES[b.reason](b));
  if (messages.length === 1) return messages[0];
  return `${messages.slice(0, -1).join(", ")} and ${messages[messages.length - 1]}`;
};

const Provider: React.FC = () => {
  const toast = useToast();
  const [teamId, teamSlug] = useStore((state) => [
    state.teamId,
    state.teamSlug,
  ]);
  const { paymentProvider } = usePaymentProvider();
  const [migratedProvider, setMigratedProvider] =
    useState<PaymentProvider | null>(null);
  const provider = migratedProvider ?? paymentProvider ?? null;

  const [dialogState, setDialogState] = useState<DialogState>({
    type: "closed",
  });

  const handleMigrateClick = async () => {
    setDialogState({ type: "checking" });
    const result = await getStripeCanMigrate(teamSlug);
    if (result.canMigrate) {
      setDialogState({ type: "confirm" });
    } else {
      setDialogState({ type: "blocked", blockers: result.blockers });
    }
  };

  /**
   * Placeholder - updates local state only, no DB tables updated
   * @todo Write to Hasura
   */
  const handleConfirmMigration = () => {
    console.log(
      `[Provider] Migrating team ${teamId} from ${PROVIDER_LABELS[provider!]} to Stripe`,
    );
    setMigratedProvider("stripe");
    setDialogState({ type: "closed" });
    toast.success("Migration to Stripe successful");
    console.log("[Provider] Migration complete");
  };

  const handleClose = () => setDialogState({ type: "closed" });

  const isStripe = provider === "stripe";
  const canMigrateToStripe = hasFeatureFlag("STRIPE_MIGRATION");
  const { data: stripeConnectStatus, isLoading: isStripeStatusLoading } =
    useStripeConnectStatus(teamSlug);

  const renderProviderAction = () => {
    if (isStripe) {
      return (
        <WarningContainer icon={WarningIcon} sx={{ my: 0 }}>
          Stripe payments are not yet available. Applicants will not be able to
          pay online until this is complete.
        </WarningContainer>
      );
    }

    if (canMigrateToStripe) {
      if (isStripeStatusLoading || !stripeConnectStatus?.connected) {
        return null;
      }

      return (
        <Box>
          <Button
            onClick={handleMigrateClick}
            variant="contained"
            disabled={dialogState.type === "checking"}
          >
            Migrate to Stripe
          </Button>
        </Box>
      );
    }

    return (
      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        Switching to Stripe is not yet available.
      </Typography>
    );
  };

  return (
    <NewSettingsSection>
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 4 }}>
          <InputLegend gutterBottom>Payment provider</InputLegend>
          <SettingsDescription>
            {provider ? (
              <>
                <p>
                  Manage your team's payment provider for processing application
                  fees.
                </p>
                <p>
                  PlanX is migrating from GOV.UK Pay to Stripe. Once migrated,
                  all new payment sessions will be processed through Stripe.
                </p>
                <p>
                  Migration requires that there are no active payment sessions
                  in progress. If sessions are found, please wait for them to
                  complete before trying again.
                </p>
              </>
            ) : (
              <p>
                Your team's payment provider for processing application fees.
              </p>
            )}
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
            {provider ? (
              <>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Typography variant="body1">Current provider:</Typography>
                  <Chip
                    label={PROVIDER_LABELS[provider]}
                    color="info"
                    size="small"
                  />
                </Box>
                {renderProviderAction()}
              </>
            ) : (
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                No active payment provider
              </Typography>
            )}
          </Box>
        </Grid>
      </Grid>

      <Dialog
        open={dialogState.type !== "closed"}
        onClose={dialogState.type === "checking" ? undefined : handleClose}
      >
        {dialogState.type === "checking" && (
          <>
            <DialogTitle component="h1" variant="h3">
              Checking active sessions
            </DialogTitle>
            <DialogContent
              sx={{
                display: "flex",
                justifyContent: "center",
                py: 4,
              }}
            >
              <CircularProgress />
            </DialogContent>
          </>
        )}

        {dialogState.type === "blocked" && (
          <>
            <DialogTitle component="h1" variant="h3">
              Unable to migrate to Stripe
            </DialogTitle>
            <DialogContent dividers>
              <DialogContentText>
                This team cannot migrate to Stripe yet because{" "}
                {formatBlockerList(dialogState.blockers)}.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={handleClose}
                color="secondary"
                variant="contained"
              >
                Close
              </Button>
            </DialogActions>
          </>
        )}

        {dialogState.type === "confirm" && (
          <>
            <DialogTitle component="h1" variant="h3">
              Confirm migration to Stripe
            </DialogTitle>
            <DialogContent dividers>
              <DialogContentText>
                No active payment sessions found. You can proceed with migrating
                this team's payment provider from GOV.UK Pay to Stripe.
              </DialogContentText>
              <DialogContentText sx={{ mt: 1 }}>
                This action cannot be undone. All future payment sessions will
                be processed through Stripe.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={handleClose}
                color="secondary"
                variant="contained"
              >
                Cancel
              </Button>
              <Button onClick={handleConfirmMigration} variant="contained">
                Migrate to Stripe
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </NewSettingsSection>
  );
};

export default Provider;
