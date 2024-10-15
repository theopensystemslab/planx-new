import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControlLabel, {
  formControlLabelClasses,
} from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import type { FlowStatus } from "@opensystemslab/planx-core/types";
import axios from "axios";
import { useFormik } from "formik";
import { useToast } from "hooks/useToast";
import React from "react";
import { rootFlowPath } from "routes/utils";
import { FONT_WEIGHT_BOLD } from "theme";
import SettingsDescription from "ui/editor/SettingsDescription";
import SettingsSection from "ui/editor/SettingsSection";

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
  ] = useStore((state) => [
    state.flowStatus,
    state.updateFlowStatus,
    state.jwt,
    state.teamSlug,
    state.flowSlug,
    state.teamDomain,
    state.isFlowPublished,
  ]);
  const toast = useToast();

  const statusForm = useFormik<{ status: FlowStatus }>({
    initialValues: {
      status: flowStatus || "online",
    },
    onSubmit: async (values, { resetForm }) => {
      const isSuccess = await updateFlowStatus(values.status);
      if (isSuccess) {
        toast.success("Service settings updated successfully");
        // Send a Slack notification to #planx-notifications
        sendFlowStatusSlackNotification(values.status);
        // Reset "dirty" status to disable Save & Reset buttons
        resetForm({ values });
      }
    },
  });

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
    <Box component="form" onSubmit={statusForm.handleSubmit}>
      <SettingsSection>
        <Typography variant="h2" component="h3" gutterBottom>
          Status
        </Typography>
        <Typography variant="body1">
          Manage the status of your service.
        </Typography>
      </SettingsSection>
      <SettingsSection background>
        <FormControlLabel
          label={statusForm.values.status}
          sx={{
            margin: 0,
            marginBottom: 0.5,
            [`& .${formControlLabelClasses.label}`]: {
              fontWeight: FONT_WEIGHT_BOLD,
              textTransform: "capitalize",
              fontSize: 19,
            },
          }}
          control={
            <Switch
              name="service.status"
              color="primary"
              checked={statusForm.values.status === "online"}
              onChange={() =>
                statusForm.setFieldValue(
                  "status",
                  statusForm.values.status === "online" ? "offline" : "online",
                )
              }
            />
          }
        />
        <SettingsDescription>
          <p>Toggle your service between "offline" and "online".</p>
          <p>
            A service must be online to be accessed by the public, and to enable
            analytics gathering.
          </p>
          <p>Offline services can still be edited and published as normal.</p>
        </SettingsDescription>

        <PublicLink
          isFlowPublished={isFlowPublished}
          status={flowStatus || "offline"}
          subdomain={subdomainLink}
          publishedLink={publishedLink}
        />

        <Box>
          <Button
            type="submit"
            variant="contained"
            disabled={!statusForm.dirty}
          >
            Save
          </Button>
          <Button
            onClick={() => statusForm.resetForm()}
            type="reset"
            variant="contained"
            disabled={!statusForm.dirty}
            color="secondary"
            sx={{ ml: 1.5 }}
          >
            Reset changes
          </Button>
        </Box>
      </SettingsSection>
    </Box>
  );
};

export default FlowStatus;
