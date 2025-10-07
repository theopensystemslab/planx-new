import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { getIn, useFormik } from "formik";
import { useToast } from "hooks/useToast";
import { richText } from "lib/yupExtensions";
import React from "react";
import SettingsSection from "ui/editor/SettingsSection";
import { boolean, object, string } from "yup";

import type { FlowSettings } from "../../../../../../types";
import { useStore } from "../../../../lib/store";
import { TextInput } from "./components/TextInput";

const validationSchema = object({
  elements: object({
    help: object({
      heading: string().when("show", {
        is: true,
        then: string().required("Heading is required"),
        otherwise: string().optional(),
      }),
      content: richText().when("show", {
        is: true,
        then: richText().required("Content is required"),
        otherwise: richText().optional(),
      }),
      show: boolean(),
    }).optional(),
  }).optional(),
});

export const HelpPage = () => {
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
        help: {
          heading: flowSettings?.elements?.help?.heading ?? "",
          content: flowSettings?.elements?.help?.content ?? "",
          show: flowSettings?.elements?.help?.show ?? false,
        },
      },
    },
    onSubmit: async (values, { resetForm }) => {
      await updateFlowSettings(values);
      setFlowSettings(values);
      toast.success("Help page updated successfully");
      resetForm({ values });
    },
    validationSchema,
    validateOnBlur: false,
    validateOnChange: false,
  });

  return (
    <Box component="form" onSubmit={elementsForm.handleSubmit} mb={2}>
      <SettingsSection>
        <Typography variant="h2" gutterBottom>
          Help page
        </Typography>
        <Typography variant="body1">
          A place to communicate FAQs, useful tips, or contact information.
        </Typography>
      </SettingsSection>
      <SettingsSection background>
        <TextInput
          title="Help page"
          richText
          switchProps={{
            name: "elements.help.show",
            checked: elementsForm.values.elements?.help?.show,
            onChange: elementsForm.handleChange,
          }}
          headingInputProps={{
            name: "elements.help.heading",
            value: elementsForm.values.elements?.help?.heading,
            onChange: elementsForm.handleChange,
            errorMessage: getIn(elementsForm.errors, "elements.help.heading"),
          }}
          contentInputProps={{
            name: "elements.help.content",
            value: elementsForm.values.elements?.help?.content,
            onChange: elementsForm.handleChange,
            errorMessage: getIn(elementsForm.errors, "elements.help.content"),
          }}
        />
        <Box>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={!elementsForm.dirty}
          >
            Update help page
          </Button>
        </Box>
      </SettingsSection>
    </Box>
  );
};
