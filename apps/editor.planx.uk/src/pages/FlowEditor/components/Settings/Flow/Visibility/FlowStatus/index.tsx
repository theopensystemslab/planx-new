import PendingActionsIcon from "@mui/icons-material/PendingActions";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { WarningContainer } from "@planx/components/shared/Preview/WarningContainer";
import { ConfirmationDialog } from "components/ConfirmationDialog";
import { format } from "date-fns";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useState } from "react";
import { useLocation } from "react-use";
import { FONT_WEIGHT_BOLD } from "theme";
import FlowTag from "ui/editor/FlowTag/FlowTag";
import ChecklistItem from "ui/shared/ChecklistItem/ChecklistItem";
import ErrorWrapper from "ui/shared/ErrorWrapper";
import { rootFlowPath } from "utils/routeUtils/utils";

import { useSlackMessage } from "../../../hooks/useSlackMessage";
import SettingsFormContainer from "../../../shared/SettingsForm";
import { Description } from "./components/Description";
import { PublicLink } from "./components/PublicLink";
import { GET_FLOW_STATUS, UPDATE_FLOW_STATUS } from "./queries";
import { validationSchema } from "./schema";
import type {
  FlowStatusFormValues,
  GetFlowStatus,
  UpdateFlowStatus,
} from "./types";

interface FlowStatusProps {
  preloadedData?: GetFlowStatus;
}

const FlowStatus: React.FC<FlowStatusProps> = ({ preloadedData }) => {
  const [flowId, flowSlug, teamDomain, teamSlug] = useStore((state) => [
    state.id,
    state.flowSlug,
    state.teamDomain,
    state.teamSlug,
  ]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [confirmationError, setConfirmationError] = useState(false);
  const [privacyError, setPrivacyError] = useState(false);

  const { mutate: sendSlackMessage } = useSlackMessage();

  const { origin } = useLocation();

  const publishedLink = `${origin}${rootFlowPath(false)}/published`;

  const subdomainLink = teamDomain && `https://${teamDomain}/${flowSlug}`;

  const isProduction = import.meta.env.VITE_APP_ENV === "production";

  return (
    <SettingsFormContainer<
      GetFlowStatus,
      UpdateFlowStatus,
      FlowStatusFormValues
    >
      query={GET_FLOW_STATUS}
      mutation={UPDATE_FLOW_STATUS}
      preloadedData={preloadedData}
      validationSchema={validationSchema}
      legend={"Flow status"}
      description={<Description />}
      getInitialValues={({ flow: { status } }) => ({ status })}
      queryVariables={{ flowId }}
      getMutationVariables={(values) => ({ flowId, ...values })}
      showActionButtons={false}
      defaultValues={{ status: "offline" }}
      onSuccess={(data, _formikHelpers, values) => {
        const oldStatus = data?.flow.status;
        const hasStatusUpdated = oldStatus && values.status !== oldStatus;
        if (hasStatusUpdated) {
          const emoji = {
            online: ":large_green_circle:",
            offline: ":no_entry:",
          };
          const message = `${emoji[values.status]} *${teamSlug}/${flowSlug}* is now ${values.status}`;
          sendSlackMessage(message);
        }
      }}
    >
      {({ formik, data }) => {
        const isTrial = data?.flow.team.settings.isTrial;
        const isTemplate = Boolean(data?.flow.templatedFrom);
        const isPublished = Boolean(data?.flow.publishedFlows.length);

        return (
          <>
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
                  formik.values.status === "online" ? "online" : "offline"
                }
              >
                {formik.values.status}
              </FlowTag>
            </Box>
            {isProduction && (
              <ErrorWrapper
                error={
                  privacyError
                    ? "You must enable the privacy page to set your service online"
                    : ""
                }
              >
                <Box sx={{ display: "flex" }}>
                  <Button
                    id="set-status-button"
                    data-testid="set-status-button"
                    sx={{ mb: 2 }}
                    disabled={data?.flow.team.settings.isTrial}
                    variant="contained"
                    onClick={() => {
                      if (
                        !data?.flow.hasPrivacyPage &&
                        formik.values.status !== "online"
                      ) {
                        setPrivacyError(true);
                        return;
                      }

                      setPrivacyError(false);
                      setDialogOpen(true);
                    }}
                  >
                    {formik.values.status === "online"
                      ? "Set your service offline"
                      : "Set your service online"}
                  </Button>
                </Box>
              </ErrorWrapper>
            )}
            {!isProduction && (
              <Box sx={{ display: "flex" }}>
                <Button
                  id="set-status-button"
                  data-testid="set-status-button"
                  sx={{ mb: 2 }}
                  disabled={data?.flow.team.settings.isTrial}
                  variant="contained"
                  onClick={async () => {
                    await formik.setFieldValue(
                      "status",
                      formik.values.status === "online" ? "offline" : "online",
                    );
                    await formik.submitForm();
                  }}
                >
                  {formik.values.status === "online"
                    ? "Set your service offline"
                    : "Set your service online"}
                </Button>
              </Box>
            )}
            {isProduction && (
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
                  await formik.setFieldValue(
                    "status",
                    formik.values.status === "online" ? "offline" : "online",
                  );
                  await formik.submitForm();
                }}
                title="Confirm status change"
                confirmText={
                  formik.values.status === "online"
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
                        {formik.values.status === "online"
                          ? "Services that are set offline are no longer publicly discoverable and cannot accept responses from users."
                          : "Only services that are ready to be publicly discoverable and accept responses from users should be set online."}
                      </Typography>
                      <Grid item xs={12} sx={{ pointerEvents: "auto" }}>
                        <ChecklistItem
                          id="status-confirmation-checkbox"
                          data-testid="status-confirmation-checkbox"
                          label={
                            formik.values.status === "online"
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
            {!isTrial && (
              <PublicLink
                isFlowPublished={isPublished}
                status={formik.values.status || "offline"}
                subdomain={subdomainLink}
                publishedLink={publishedLink}
              />
            )}
            {data?.flow.firstOnlineAt && (
              <Typography variant="body2">
                Your service first went online:{" "}
                {format(new Date(data.flow.firstOnlineAt), "HH:mm dd/MM/yy")}
              </Typography>
            )}
          </>
        );
      }}
    </SettingsFormContainer>
  );
};

export default FlowStatus;
