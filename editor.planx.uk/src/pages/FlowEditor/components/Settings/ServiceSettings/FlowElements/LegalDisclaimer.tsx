import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { getIn, useFormik } from "formik";
import { useToast } from "hooks/useToast";
import React from "react";
import SettingsSection from "ui/editor/SettingsSection";
import { boolean, object, string } from "yup";

import type { FlowSettings } from "../../../../../../types";
import { useStore } from "../../../../lib/store";
import { TextInput } from "./components/TextInput";

const validationSchema = object({
  elements: object({
    legalDisclaimer: object({
      heading: string().when("show", {
        is: true,
        then: string().required("Heading is required"),
        otherwise: string().optional(),
      }),
      content: string().when("show", {
        is: true,
        then: string().required("Content is required"),
        otherwise: string().optional(),
      }),
      show: boolean(),
    }).optional(),
  }).optional(),
});

export const LegalDisclaimer = () => {
  const [flowSettings, updateFlowSettings, setFlowSettings] = useStore(
    (state) => [
      state.flowSettings,
      state.updateFlowSettings,
      state.setFlowSettings,
    ],
  );
  const toast = useToast();

  const elementsForm = useFormik<FlowSettings>({
    initialValues: {
      elements: {
        legalDisclaimer: {
          heading: flowSettings?.elements?.legalDisclaimer?.heading ?? "",
          content: flowSettings?.elements?.legalDisclaimer?.content ?? "",
          show: flowSettings?.elements?.legalDisclaimer?.show ?? false,
        },
      },
    },
    onSubmit: async (values, { resetForm }) => {
      await updateFlowSettings(values);
      setFlowSettings(values);
      toast.success("Legal disclaimer updated successfully");
      resetForm({ values });
    },
    validationSchema,
    validateOnBlur: false,
    validateOnChange: false,
  });

  return (
    <Box component="form" onSubmit={elementsForm.handleSubmit}>
      <SettingsSection>
        <Typography variant="h2" gutterBottom>
          Legal disclaimer
        </Typography>
        <Typography variant="body1">
          Manage the legal disclaimer that users will see.
        </Typography>
      </SettingsSection>
      <SettingsSection background>
        <TextInput
          title="Legal disclaimer"
          description="Displayed on the 'Result' pages of the service (if it contains any)"
          switchProps={{
            name: "elements.legalDisclaimer.show",
            checked: elementsForm.values.elements?.legalDisclaimer?.show,
            onChange: elementsForm.handleChange,
          }}
          headingInputProps={{
            name: "elements.legalDisclaimer.heading",
            value: elementsForm.values.elements?.legalDisclaimer?.heading,
            onChange: elementsForm.handleChange,
            errorMessage: getIn(
              elementsForm.errors,
              "elements.legalDisclaimer.heading",
            ),
          }}
          contentInputProps={{
            name: "elements.legalDisclaimer.content",
            value: elementsForm.values.elements?.legalDisclaimer?.content,
            onChange: elementsForm.handleChange,
            errorMessage: getIn(
              elementsForm.errors,
              "elements.legalDisclaimer.content",
            ),
          }}
        />
        <Box>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={!elementsForm.dirty}
          >
            Update legal disclaimer
          </Button>
        </Box>
      </SettingsSection>
    </Box>
  );
};
