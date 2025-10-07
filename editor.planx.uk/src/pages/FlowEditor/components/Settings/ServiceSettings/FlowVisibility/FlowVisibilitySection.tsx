import PendingActionsIcon from "@mui/icons-material/PendingActions";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import type { FlowStatus as FlowStatusType } from "@opensystemslab/planx-core/types";
import { WarningContainer } from "@planx/components/shared/Preview/WarningContainer";
import axios from "axios";
import { ConfirmationDialog } from "components/ConfirmationDialog";
import { useFormik } from "formik";
import { useToast } from "hooks/useToast";
import React, { useEffect, useState } from "react";
import { Link } from "react-navi";
import { rootFlowPath } from "routes/utils";
import { FONT_WEIGHT_BOLD } from "theme";
import FlowTag from "ui/editor/FlowTag/FlowTag";
import SettingsDescription from "ui/editor/SettingsDescription";
import SettingsSection from "ui/editor/SettingsSection";
import ChecklistItem from "ui/shared/ChecklistItem/ChecklistItem";
import ErrorWrapper from "ui/shared/ErrorWrapper";
import { Switch } from "ui/shared/Switch";

import { useStore } from "../../../../lib/store";
import { PublicLink } from "./PublicLink";

export const FlowVisibility = () => {
  const [
    flowStatus,
    updateFlowStatus,
    canCreateFromCopy,
    updateCanCreateFromCopy,
    isListedOnLPS,
    setIsListedOnLPS,
    description,
    summary,
    token,
    teamSlug,
    flowSlug,
    teamDomain,
    isFlowPublished,
    isTrial,
    flowSettings,
    isTemplate,
    isTemplatedFrom,
  ] = useStore((state) => [
    state.flowStatus,
    state.updateFlowStatus,
    state.flowCanCreateFromCopy,
    state.updateFlowCanCreateFromCopy,
    state.isFlowListedOnLPS,
    state.setIsFlowListedOnLPS,
    state.flowDescription,
    state.flowSummary,
    state.jwt,
    state.teamSlug,
    state.flowSlug,
    state.teamDomain,
    state.isFlowPublished,
    state.teamSettings.isTrial,
    state.flowSettings,
    state.isTemplate,
    state.isTemplatedFrom,
  ]);

  const toast = useToast();

  const statusForm = useFormik<{ status: FlowStatusType }>({
    initialValues: {
      status: flowStatus || "online",
    },
    onSubmit: async (values, { resetForm }) => {
      const isSuccess = await updateFlowStatus(values.status);
      if (!isSuccess) return toast.error("Failed to update settings");

      toast.success("Service settings updated successfully");
      sendFlowStatusSlackNotification(values.status);
      resetForm({ values });
    },
  });

  const copyForm = useFormik<{ canCreateFromCopy: boolean }>({
    initialValues: {
      canCreateFromCopy: canCreateFromCopy ?? false,
    },
    onSubmit: async (values, { resetForm }) => {
      const isSuccess = await updateCanCreateFromCopy(values.canCreateFromCopy);
      if (isSuccess) {
        toast.success("Service settings updated successfully");
        resetForm({ values });
      }
    },
  });

  const listingForm = useFormik<{ isListedOnLPS: boolean }>({
    initialValues: {
      isListedOnLPS: isListedOnLPS ?? false,
    },
    validate: () => {
      if (!description)
        return {
          isListedOnLPS:
            "Service description required - please set via the 'About this flow' tab",
        };
      if (!summary)
        return {
          isListedOnLPS:
            "Service summary required  - please set via the 'About this flow' tab",
        };
    },
    onSubmit: async (values, { resetForm }) => {
      const isSuccess = await setIsListedOnLPS(values.isListedOnLPS);
      if (isSuccess) {
        toast.success("Service settings updated successfully");
        resetForm({ values });
      }
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

  const slackMemberID = "U05KXM9DQ4B";

  const sendFlowStatusSlackNotification = async (status: FlowStatusType) => {
    const skipTeamSlugs = [
      "open-digital-planning",
      "opensystemslab",
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

  const showCopySection = !isTemplatedFrom && !isTemplate;

  return (
    <Box>
      <SettingsSection>
        <Typography variant="h2" gutterBottom>
          Visibility
        </Typography>
        <Typography variant="body1">
          Manage the visibility and listing of your service.
        </Typography>
      </SettingsSection>
      <SettingsSection background>
        <Box component="form" onSubmit={statusForm.handleSubmit}>
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
                Source templates are discoverable from the "Add a new flow"
                modal when they are online.
              </Typography>
            </WarningContainer>
          )}
          <Box display="flex" alignItems="center">
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
              <Box>
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
          )}
        </Box>
      </SettingsSection>
      {showCopySection && (
        <SettingsSection background>
          <Box component="form" onSubmit={copyForm.handleSubmit}>
            <Switch
              label={
                copyForm.values.canCreateFromCopy
                  ? "Can be copied to create new services"
                  : "Cannot be copied to create new services"
              }
              name={"service.canCreateFromCopy"}
              variant="editorPage"
              checked={copyForm.values.canCreateFromCopy}
              onChange={() =>
                copyForm.setFieldValue(
                  "canCreateFromCopy",
                  !copyForm.values.canCreateFromCopy,
                )
              }
            />
            <SettingsDescription>
              <p>
                Control if this flow can be used to create new services in other
                teams. The flow can still be copied and modified within your
                team.
              </p>
            </SettingsDescription>

            <Box>
              <Button
                type="submit"
                variant="contained"
                disabled={!copyForm.dirty}
              >
                Save
              </Button>
              <Button
                onClick={() => copyForm.resetForm()}
                type="reset"
                variant="contained"
                disabled={!copyForm.dirty}
                color="secondary"
                sx={{ ml: 1.5 }}
              >
                Reset changes
              </Button>
            </Box>
          </Box>
        </SettingsSection>
      )}
      <SettingsSection background>
        <Box component="form" onSubmit={listingForm.handleSubmit}>
          <Switch
            label={
              listingForm.values.isListedOnLPS
                ? "Service is listed on localplanning.services"
                : "Service is not listed on localplanning.services"
            }
            name={"service.isListedOnLPS"}
            variant="editorPage"
            checked={listingForm.values.isListedOnLPS}
            onChange={() =>
              listingForm.setFieldValue(
                "isListedOnLPS",
                !listingForm.values.isListedOnLPS,
              )
            }
          />
          <SettingsDescription>
            <p>
              Control if this service will be listed on{" "}
              <a href="https://www.localplanning.services">
                localplanning.service (opens in a new tab)
              </a>
              . By listing your service you allow applicants and agents to
              browse the services which you offer via PlanX.
            </p>
            <p>
              Listing your service requires a description and summary. These can
              be provided on{" "}
              <Link href="../about">the "About this flow" page</Link>.
            </p>
          </SettingsDescription>
          <ErrorWrapper
            error={
              (listingForm.dirty &&
                listingForm.submitCount &&
                listingForm.errors.isListedOnLPS) ||
              ""
            }
          >
            <Box>
              <Button
                type="submit"
                variant="contained"
                disabled={!listingForm.dirty}
              >
                Save
              </Button>
              <Button
                onClick={() => listingForm.resetForm()}
                type="reset"
                variant="contained"
                disabled={!listingForm.dirty}
                color="secondary"
                sx={{ ml: 1.5 }}
              >
                Reset changes
              </Button>
            </Box>
          </ErrorWrapper>
        </Box>
      </SettingsSection>
    </Box>
  );
};
