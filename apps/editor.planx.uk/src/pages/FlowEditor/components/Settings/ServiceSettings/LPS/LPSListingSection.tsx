import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { Link } from "@tanstack/react-router";
import { useFormik } from "formik";
import { useToast } from "hooks/useToast";
import React from "react";
import SettingsDescription from "ui/editor/SettingsDescription";
import SettingsSection from "ui/editor/SettingsSection";
import ErrorWrapper from "ui/shared/ErrorWrapper";
import { Switch } from "ui/shared/Switch";

import { useStore } from "../../../../lib/store";

export const LPSListing = () => {
  const [isListedOnLPS, setIsListedOnLPS, summary, teamSlug, flowSlug] =
    useStore((state) => [
      state.isFlowListedOnLPS,
      state.setIsFlowListedOnLPS,
      state.flowSummary,
      state.teamSlug,
      state.flowSlug,
    ]);

  const toast = useToast();

  const form = useFormik<{ isListedOnLPS: boolean }>({
    initialValues: {
      isListedOnLPS: isListedOnLPS ?? false,
    },
    validate: () => {
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
        // Reset "dirty" status to disable Save & Reset buttons
        resetForm({ values });
      }
    },
  });

  return (
    <Box component="form" onSubmit={form.handleSubmit} mb={2}>
      <SettingsSection>
        <Typography variant="h2" component="h3" gutterBottom>
          Listings
        </Typography>
        <Typography variant="body1">
          Manage how this service is listed and indexed
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
            form.setFieldValue("isListedOnLPS", !form.values.isListedOnLPS)
          }
        />
        <SettingsDescription>
          <p>
            Control if this service will be listed on{" "}
            <a href="https://www.localplanning.services">
              localplanning.service (opens in a new tab)
            </a>
            . By listing your service you allow applicants and agents to browse
            the services which you offer via PlanX.
          </p>
          <p>
            Listing your service requires a summary. This can be provided on{" "}
            <Link
              to="/$team/$flow/about"
              params={{ team: teamSlug, flow: flowSlug }}
            >
              the "About this flow" page
            </Link>
            .
          </p>
        </SettingsDescription>
        <ErrorWrapper
          error={
            (form.dirty && form.submitCount && form.errors.isListedOnLPS) || ""
          }
        >
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
        </ErrorWrapper>
      </SettingsSection>
    </Box>
  );
};
