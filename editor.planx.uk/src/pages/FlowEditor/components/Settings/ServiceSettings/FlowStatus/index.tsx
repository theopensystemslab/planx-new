import PendingActionsIcon from "@mui/icons-material/PendingActions";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import type { FlowStatus } from "@opensystemslab/planx-core/types";
import { WarningContainer } from "@planx/components/shared/Preview/WarningContainer";
import axios from "axios";
import { ConfirmationDialog } from "components/ConfirmationDialog";
import { useFormik } from "formik";
import { useToast } from "hooks/useToast";
import React, { useEffect, useState } from "react";
import { rootFlowPath } from "routes/utils";
import { FONT_WEIGHT_BOLD } from "theme";
import FlowTag from "ui/editor/FlowTag/FlowTag";
import SettingsDescription from "ui/editor/SettingsDescription";
import SettingsSection from "ui/editor/SettingsSection";
import ChecklistItem from "ui/shared/ChecklistItem/ChecklistItem";
import ErrorWrapper from "ui/shared/ErrorWrapper";

import { useStore } from "../../../../lib/store";
import { PublicLink } from "./PublicLink";

const FlowStatus = () => {
  const [
    flowStatus,
    updateFlowStatus,
    token,
    teamSlug,
    flowSlug,
    teamDomain,
    isFlowPublished,
    isTrial,
    flowSettings,
    isTemplate,
  ] = useStore((state) => [
    state.flowStatus,
    state.updateFlowStatus,
    state.jwt,
    state.teamSlug,
    state.flowSlug,
    state.teamDomain,
    state.isFlowPublished,
    state.teamSettings.isTrial,
    state.flowSettings,
    state.isTemplate,
  ]);
  const toast = useToast();

  const statusForm = useFormik<{ status: FlowStatus }>({
    initialValues: {
      status: flowStatus || "online",
    },
    onSubmit: async (values, { resetForm }) => {
      const isSuccess = await updateFlowStatus(values.status);
      if (!isSuccess) return toast.error("Failed to update settings");

      toast.success("Service settings updated successfully");
      // Send a Slack notification to #planx-notifications
      sendFlowStatusSlackNotification(values.status);
      // Reset "dirty" status to disable Save & Reset buttons
      resetForm({ values });
    },
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [confirmationError, setConfirmationError] = useState(false);
  const [privacyError, setPrivacyError] = useState(false);

  useEffect(() => {
    if (flowSettings?.elements?.privacy?.show === true) {
      setPrivacyError(false);
    }
  }, [flowSettings?.elements?.privacy?.show]);

  const publishedLink = `${window.location.origin}${rootFlowPath(
    false,
  )}/published`;

  const subdomainLink = teamDomain && `https://${teamDomain}/${flowSlug}`;

  // Currently Silvia
  const slackMemberID = "U05KXM9DQ4B";

  const sendFlowStatusSlackNotification = async (status: FlowStatus) => {
    const skipTeamSlugs = [
      "open-digital-planning",
      "opensystemslab",
      "planx",
      "planx-university",
      "templates",
      "testing",
      "wikihouse",
    ];
    if (skipTeamSlugs.includes(teamSlug)) return;

    const emoji = {
      online: ":large_green_circle:",
      offline: ":no_entry:",
    };
    const message = `${emoji[status]} *${teamSlug}/${flowSlug}* is now ${status} (<@${slackMemberID}>)`;

    return axios.post(
      `${import.meta.env.VITE_APP_API_URL}/send-slack-notification`,
      {
        message: message,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
  };

  return (
    <Box component="form" onSubmit={statusForm.handleSubmit} mb={2}>
      <SettingsSection>
        <Typography variant="h2" component="h3" gutterBottom>
          Status
        </Typography>
        <Typography variant="body1">
          Manage the status of your service.
        </Typography>
      </SettingsSection>
      <SettingsSection background>
        {isTrial && (
          <WarningContainer>
            <PendingActionsIcon sx={{ mr: 1 }} />
            <Typography variant="body2">
              Trial accounts cannot set flows online.
            </Typography>
          </WarningContainer>
        )}
        {isTemplate && (
          <WarningContainer>
            <PendingActionsIcon sx={{ mr: 1 }} />
            <Typography variant="body2">
              Source templates are discoverable from the "Add a new service"
              modal when they are online.
            </Typography>
          </WarningContainer>
        )}
        <Box display="flex" alignItems="center" mb={2}>
          <Typography
            variant="body1"
            fontWeight={FONT_WEIGHT_BOLD}
            sx={{ mr: 1 }}
          >
            Your service is currently
          </Typography>
          <FlowTag
            tagType="status"
            statusVariant={
              statusForm.values.status === "online" ? "online" : "offline"
            }
          >
            {statusForm.values.status}
          </FlowTag>
        </Box>
        {import.meta.env.VITE_APP_ENV === "production" && (
          <ErrorWrapper
            error={
              privacyError
                ? "You must enable the privacy page below to set your service online"
                : ""
            }
          >
            <Box sx={{ display: "flex" }}>
              <Button
                id="set-status-button"
                data-testid="set-status-button"
                sx={{ mb: 2 }}
                disabled={isTrial}
                variant="contained"
                onClick={() => {
                  if (
                    !flowSettings?.elements?.privacy?.show &&
                    statusForm.values.status !== "online"
                  ) {
                    setPrivacyError(true);
                    return;
                  }

                  setPrivacyError(false);
                  setDialogOpen(true);
                }}
              >
                {statusForm.values.status === "online"
                  ? "Set your service offline"
                  : "Set your service online"}
              </Button>
            </Box>
          </ErrorWrapper>
        )}
        {import.meta.env.VITE_APP_ENV !== "production" && (
          <Button
            id="set-status-button"
            data-testid="set-status-button"
            sx={{ mb: 2 }}
            disabled={isTrial}
            variant="contained"
            onClick={async () => {
              await statusForm.setFieldValue(
                "status",
                statusForm.values.status === "online" ? "offline" : "online",
              );
              await statusForm.submitForm();
            }}
          >
            {statusForm.values.status === "online"
              ? "Set your service offline"
              : "Set your service online"}
          </Button>
        )}
        {import.meta.env.VITE_APP_ENV === "production" && (
          <ConfirmationDialog
            open={dialogOpen}
            onClose={async (confirmed) => {
              if (!confirmed) {
                setDialogOpen(false);
                setCompleted(false);
                setConfirmationError(false);
                return;
              }

              if (!completed) {
                setConfirmationError(true);
                return;
              }

              setDialogOpen(false);
              setCompleted(false);
              setConfirmationError(false);
              await statusForm.setFieldValue(
                "status",
                statusForm.values.status === "online" ? "offline" : "online",
              );
              await statusForm.submitForm();
            }}
            title="Confirm status change"
            confirmText={
              statusForm.values.status === "online"
                ? "Set offline"
                : "Set online"
            }
            cancelText="Cancel"
          >
            <Box marginTop={2}>
              <ErrorWrapper
                error={confirmationError ? `Confirm before continuing` : ``}
              >
                <Grid container component="fieldset" sx={{ margin: 0 }}>
                  <Typography gutterBottom>
                    {statusForm.values.status === "online"
                      ? "Services that are set offline are no longer publicly discoverable and cannot accept responses from users."
                      : "Only services that are ready to be publicly discoverable and accept responses from users should be set online."}
                  </Typography>
                  <Grid item xs={12} sx={{ pointerEvents: "auto" }}>
                    <ChecklistItem
                      id="status-confirmation-checkbox"
                      data-testid="status-confirmation-checkbox"
                      label={
                        statusForm.values.status === "online"
                          ? "This service will no longer be able to receive public responses"
                          : "This service is ready to accept public responses"
                      }
                      checked={completed}
                      onChange={() => {
                        setCompleted(!completed);
                        setConfirmationError(false);
                      }}
                    />
                  </Grid>
                </Grid>
              </ErrorWrapper>
            </Box>
          </ConfirmationDialog>
        )}
        <SettingsDescription>
          {import.meta.env.VITE_APP_ENV === "production" && (
            <>
              <p>
                A service must be online to be accessed by the public, and to
                enable analytics gathering.
              </p>
              <p>
                Offline services can still be edited and published as normal.
              </p>
            </>
          )}
          {import.meta.env.VITE_APP_ENV !== "production" && (
            <>
              <p>
                A service must be online to test integrations on your public
                link.
              </p>
            </>
          )}
        </SettingsDescription>
        {!isTrial && (
          <PublicLink
            isFlowPublished={isFlowPublished}
            status={flowStatus || "offline"}
            subdomain={subdomainLink}
            publishedLink={publishedLink}
          />
        )}{" "}
      </SettingsSection>
    </Box>
  );
};

export default FlowStatus;
