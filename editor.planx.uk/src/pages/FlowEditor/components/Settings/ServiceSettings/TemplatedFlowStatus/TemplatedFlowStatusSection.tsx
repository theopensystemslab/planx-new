import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";
import { useFormik } from "formik";
import { useToast } from "hooks/useToast";
import React, { useState } from "react";
import SettingsDescription from "ui/editor/SettingsDescription";
import SettingsSection from "ui/editor/SettingsSection";

import { useStore } from "../../../../lib/store";

export const TemplatedFlowStatus = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

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
        toast.success("Successfully opted-out of templated flow updates");
      }
    },
  });

  return (
    <Box component="form" onSubmit={form.handleSubmit} mb={2}>
      <SettingsSection>
        <Typography variant="h2" component="h3" gutterBottom>
          Templated flow updates
        </Typography>
        <Typography variant="body1">
          Manage how your templated flow receives updates.
        </Typography>
      </SettingsSection>
      <SettingsSection background>
        <SettingsDescription>
          <p>
            <strong>
              {`This service is templated from ${sourceTemplateTeamName}.`}
            </strong>
          </p>
          <p>
            This means this service will update whenever the source template is
            published. Updates are made to reflect legislative changes,
            introduce additional functionality and improve user experience.
          </p>
          <p>
            If you no longer wish to receive updates and instead manage the
            content of this service manually you can do this by opting out of
            updates below.
          </p>
          <p>
            Please note that once you opt out of updates, you will be fully
            responsible for managing all content in this service. Opting back
            into templated flow updates is not currently supported.
          </p>
        </SettingsDescription>
        <Box>
          <Button
            onClick={() => setIsOpen(true)}
            variant="contained"
            color="warning"
          >
            Opt-out of updates
          </Button>
        </Box>
      </SettingsSection>
      {isOpen && (
        <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
          <DialogTitle component="h1" variant="h3">
            Opt-out of templated flow updates
          </DialogTitle>
          <DialogContent dividers>
            <DialogContentText>
              Are you sure you want to opt-out of templated flow updates and
              manage the content of this service manually?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setIsOpen(false)}
              color="secondary"
              variant="contained"
              sx={{ backgroundColor: "background.default" }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => form.submitForm()}
              type="submit"
              color="warning"
              variant="contained"
            >
              Opt-out of updates
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};
