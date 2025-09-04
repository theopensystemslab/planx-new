import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useFormik } from "formik";
import { useToast } from "hooks/useToast";
import React from "react";
import SettingsDescription from "ui/editor/SettingsDescription";
import SettingsSection from "ui/editor/SettingsSection";
import { Switch } from "ui/shared/Switch";

import { useStore } from "../../../../lib/store";

export const LPSListing = () => {
  const [isListedOnLPS, setIsListedOnLPS] = useStore((state) => [
    state.isFlowListedOnLPS,
    state.setIsFlowListedOnLPS,
  ]);

  const toast = useToast();

  const form = useFormik<{ isListedOnLPS: boolean }>({
    initialValues: {
      isListedOnLPS: isListedOnLPS ?? false,
    },
    // TODO: Validation - must be online, must have description...
    onSubmit: async (values, { resetForm }) => {
      const isSuccess = await setIsListedOnLPS(values.isListedOnLPS);
      if (isSuccess) {
        toast.success("Service settings updated successfully");
        // Reset "dirty" status to disable Save & Reset buttons
        resetForm({ values });
      }
    },
  });

  return (
    <Box component="form" onSubmit={form.handleSubmit} mb={2}>
      <SettingsSection>
        <Typography variant="h2" component="h3" gutterBottom>
          LocalPlanning.services
        </Typography>
        <Typography variant="body1">
          Manage how this service is listed on localplanning.services
        </Typography>
      </SettingsSection>
      <SettingsSection background>
        <Switch
          label={
            form.values.isListedOnLPS
              ? "Service is listed on localplanning.services"
              : "Service is not listed on localplanning.services"
          }
          name={"service.status"}
          variant="editorPage"
          checked={form.values.isListedOnLPS}
          onChange={() =>
            form.setFieldValue(
              "isListedOnLPS",
              !form.values.isListedOnLPS,
            )
          }
        />
        <SettingsDescription>
          <p>Control if this service will be listed on localplanning.services. By listing your service you allow applicants and agents to browse the services which you offer via PlanX.</p>
        </SettingsDescription>
        <Box>
          <Button type="submit" variant="contained" disabled={!form.dirty}>
            Save
          </Button>
          <Button
            onClick={() => form.resetForm()}
            type="reset"
            variant="contained"
            disabled={!form.dirty}
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
