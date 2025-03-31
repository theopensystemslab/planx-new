import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useFormik } from "formik";
import { useToast } from "hooks/useToast";
import React from "react";
import InputGroup from "ui/editor/InputGroup";
import InputLegend from "ui/editor/InputLegend";
import SettingsSection from "ui/editor/SettingsSection";
import InputRow from "ui/shared/InputRow";

import type { FlowSettings } from "../../../../../../types";
import { useStore } from "../../../../lib/store";
import { TextInput } from "./components/TextInput";

export const FooterLinksAndLegalDisclaimer = () => {
  const [flowSettings, updateFlowSettings] = useStore((state) => [
    state.flowSettings,
    state.updateFlowSettings,
  ]);
  const toast = useToast();

  const elementsForm = useFormik<FlowSettings>({
    initialValues: {
      elements: {
        legalDisclaimer: {
          heading: flowSettings?.elements?.legalDisclaimer?.heading ?? "",
          content: flowSettings?.elements?.legalDisclaimer?.content ?? "",
          show: flowSettings?.elements?.legalDisclaimer?.show ?? false,
        },
        help: {
          heading: flowSettings?.elements?.help?.heading ?? "",
          content: flowSettings?.elements?.help?.content ?? "",
          show: flowSettings?.elements?.help?.show ?? false,
        },
        privacy: {
          heading: flowSettings?.elements?.privacy?.heading ?? "",
          content: flowSettings?.elements?.privacy?.content ?? "",
          show: flowSettings?.elements?.privacy?.show ?? false,
        },
      },
    },
    onSubmit: async (values) => {
      await updateFlowSettings(values);
      toast.success("Service settings updated successfully");
    },
    validate: () => {},
  });
  return (
    <Box component="form" onSubmit={elementsForm.handleSubmit} mb={2}>
      <SettingsSection>
        <Typography variant="h2" component="h3" gutterBottom>
          Elements
        </Typography>
        <Typography variant="body1">
          Manage the features that users will be able to see.
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
          }}
          contentInputProps={{
            name: "elements.legalDisclaimer.content",
            value: elementsForm.values.elements?.legalDisclaimer?.content,
            onChange: elementsForm.handleChange,
          }}
        />
      </SettingsSection>
      <SettingsSection background>
        <InputGroup flowSpacing>
          <InputLegend>Footer links</InputLegend>
          <InputRow>
            <TextInput
              title="Help page"
              richText
              description="A place to communicate FAQs, useful tips, or contact information"
              switchProps={{
                name: "elements.help.show",
                checked: elementsForm.values.elements?.help?.show,
                onChange: elementsForm.handleChange,
              }}
              headingInputProps={{
                name: "elements.help.heading",
                value: elementsForm.values.elements?.help?.heading,
                onChange: elementsForm.handleChange,
              }}
              contentInputProps={{
                name: "elements.help.content",
                value: elementsForm.values.elements?.help?.content,
                onChange: elementsForm.handleChange,
              }}
            />
          </InputRow>
          <InputRow>
            <TextInput
              title="Privacy page"
              richText
              description="Your privacy policy"
              switchProps={{
                name: "elements.privacy.show",
                checked: elementsForm.values.elements?.privacy?.show,
                onChange: elementsForm.handleChange,
              }}
              headingInputProps={{
                name: "elements.privacy.heading",
                value: elementsForm.values.elements?.privacy?.heading,
                onChange: elementsForm.handleChange,
              }}
              contentInputProps={{
                name: "elements.privacy.content",
                value: elementsForm.values.elements?.privacy?.content,
                onChange: elementsForm.handleChange,
              }}
            />
          </InputRow>
        </InputGroup>
      </SettingsSection>
      <SettingsSection>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={!elementsForm.dirty}
        >
          Update elements
        </Button>
      </SettingsSection>
    </Box>
  );
};
