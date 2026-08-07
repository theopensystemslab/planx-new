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
import Typography from "@mui/material/Typography";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useState } from "react";
import InputLegend from "ui/editor/InputLegend";
import NewSettingsSection from "ui/editor/NewSettingsSection";
import SettingsDescription from "ui/editor/SettingsDescription";

type PaymentProvider = "govpay" | "stripe";

type DialogState =
  | { type: "closed" }
  | { type: "checking" }
  | { type: "blocked"; sessionCount: number }
  | { type: "confirm" };

const PROVIDER_LABELS: Record<PaymentProvider, string> = {
  govpay: "GOV.UK Pay",
  stripe: "Stripe",
};

/**
 * Placeholder - randomly returns a success or failure option
 * @todo Query DB, return real results
 */
const checkActiveSessions = async (
  teamId: number,
): Promise<{ count: number; canMigrate: boolean }> => {
  console.log(
    `[Provider] Checking active payment sessions for team ${teamId}...`,
  );
  await new Promise((resolve) => setTimeout(resolve, 1500));
  const count = Math.random() > 0.5 ? 3 : 0;
  console.log(`[Provider] Found ${count} active session(s)`);
  return { count, canMigrate: count === 0 };
};

export const Provider: React.FC = () => {
  const teamId = useStore((state) => state.teamId);
  const [provider, setProvider] = useState<PaymentProvider>("govpay");
  const [dialogState, setDialogState] = useState<DialogState>({
    type: "closed",
  });

  const handleMigrateClick = async () => {
    setDialogState({ type: "checking" });
    const result = await checkActiveSessions(teamId);
    if (result.canMigrate) {
      setDialogState({ type: "confirm" });
    } else {
      setDialogState({ type: "blocked", sessionCount: result.count });
    }
  };

  /**
   * Placeholder - updates local state only, no DB tables updated
   * @todo Write to Hasura
   */
  const handleConfirmMigration = () => {
    console.log(
      `[Provider] Migrating team ${teamId} from ${PROVIDER_LABELS[provider]} to Stripe`,
    );
    setProvider("stripe");
    setDialogState({ type: "closed" });
    console.log("[Provider] Migration complete");
  };

  const handleClose = () => setDialogState({ type: "closed" });

  const isStripe = provider === "stripe";

  return (
    <NewSettingsSection>
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 4 }}>
          <InputLegend gutterBottom>Payment provider</InputLegend>
          <SettingsDescription>
            <p>
              Manage your team's payment provider for processing application
              fees.
            </p>
            <p>
              PlanX is migrating from GOV.UK Pay to Stripe. Once migrated, all
              new payment sessions will be processed through Stripe.
            </p>
            <p>
              Migration requires that there are no active payment sessions in
              progress. If sessions are found, please wait for them to complete
              before trying again.
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
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Typography variant="body1">Current provider:</Typography>
              <Chip
                label={PROVIDER_LABELS[provider]}
                color={isStripe ? "success" : "primary"}
                size="small"
              />
            </Box>
            {isStripe ? (
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                This team has been migrated to Stripe. No further action is
                needed.
              </Typography>
            ) : (
              <Box>
                <Button
                  onClick={handleMigrateClick}
                  variant="contained"
                  disabled={dialogState.type === "checking"}
                >
                  Migrate to Stripe
                </Button>
              </Box>
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
              Active payment sessions found
            </DialogTitle>
            <DialogContent dividers>
              <DialogContentText>
                Unable to migrate payment provider to Stripe. Your team
                currently has {dialogState.sessionCount} open payment
                session(s). Please wait for these to complete and try again.
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
