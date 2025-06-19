import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useFormik } from "formik";
import { useToast } from "hooks/useToast";
import React from "react";
import SettingsDescription from "ui/editor/SettingsDescription";
import SettingsSection from "ui/editor/SettingsSection";

import { useStore } from "../../../../lib/store";

export const TemplatedFlowStatus = () => {
  const [sourceTemplateTeamName, flowId] = useStore((state) => [
    state.template?.team?.name,
    state.id,
  ]);
  const toast = useToast();

  const form = useFormik<{}>({
    initialValues: {},
    onSubmit: async () => {
      const isSuccess = true; // await ejectTemplatedFlow(flowId);
      if (isSuccess) {
        toast.success("Successfully ejected from template features");
      }
    },
  });

  return (
    <Box component="form" onSubmit={form.handleSubmit} mb={2}>
      <SettingsSection>
        <Typography variant="h2" component="h3" gutterBottom>
          Templated flow status
        </Typography>
        <Typography variant="body1">
          Manage the status of your templated flow.
        </Typography>
      </SettingsSection>
      <SettingsSection background>
        <SettingsDescription>
          <p>
            <strong>
              {`Your templated flow is currently receiving updates from ${sourceTemplateTeamName}.`}
            </strong>
          </p>
          <p>
            If you no longer wish to receive updates and instead make changes
            independently, use the "Eject" button below to opt-out of templated
            flow features.
          </p>
          <p>
            Please beware that once you eject, your service will behave like a
            "copy" and you'll be fully responsible for managing it. Opting back
            into templated flow features is not currently supported.
          </p>
        </SettingsDescription>
        <Box>
          <Button
            onClick={() => form.submitForm()}
            type="submit"
            variant="contained"
            color="warning"
          >
            Eject from templated flow features
          </Button>
        </Box>
      </SettingsSection>
    </Box>
  );
};
