import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Switch, { SwitchProps } from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import { useFormik } from "formik";
import { useToast } from "hooks/useToast";
import React from "react";
import InputGroup from "ui/editor/InputGroup";
import InputLegend from "ui/editor/InputLegend";
import RichTextInput from "ui/editor/RichTextInput";
import SettingsDescription from "ui/editor/SettingsDescription";
import SettingsSection from "ui/editor/SettingsSection";
import Input, { Props as InputProps } from "ui/shared/Input";
import InputRow from "ui/shared/InputRow";
import InputRowItem from "ui/shared/InputRowItem";

import type { FlowSettings } from "../../../../../types";
import { useStore } from "../../../lib/store";
import { FlowStatusSection } from "./FlowStatusSection";

const TextInput: React.FC<{
  title: string;
  richText?: boolean;
  description?: string;
  switchProps?: SwitchProps;
  headingInputProps?: InputProps;
  contentInputProps?: InputProps;
}> = ({
  title,
  richText = false,
  description,
  switchProps,
  headingInputProps,
  contentInputProps,
}) => {
  return (
    <Box width="100%">
      <Box mb={0.5} display="flex" alignItems="center">
        <Switch {...switchProps} color="primary" />
        <Typography variant="h4" component="h5">
          {title}
        </Typography>
      </Box>
      <Box mb={1}>
        {description && (
          <SettingsDescription>{description}</SettingsDescription>
        )}
      </Box>
      <InputRow>
        <InputRowItem>
          <Input placeholder="Heading" format="bold" {...headingInputProps} />
        </InputRowItem>
      </InputRow>
      <InputRow>
        <InputRowItem>
          {richText ? (
            <RichTextInput
              placeholder="Text"
              multiline
              rows={6}
              {...contentInputProps}
            />
          ) : (
            <Input
              placeholder="Text"
              multiline
              rows={6}
              {...contentInputProps}
            />
          )}
        </InputRowItem>
      </InputRow>
    </Box>
  );
};

const ServiceSettings: React.FC = () => {
  const [
    flowSettings,
    updateFlowSettings,
  ] = useStore((state) => [
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
    <Container maxWidth="formWrap">
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
            title="Legal Disclaimer"
            description="Displayed before a user submits their application"
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
            <InputLegend>Footer Links</InputLegend>
            <InputRow>
              <TextInput
                title="Help Page"
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
                title="Privacy Page"
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
      <FlowStatusSection />
    </Container>
  );
};

export default ServiceSettings;
