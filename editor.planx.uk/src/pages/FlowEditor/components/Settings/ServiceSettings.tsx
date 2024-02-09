import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import Switch, { SwitchProps } from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import { useFormik } from "formik";
import React, { useState } from "react";
import EditorRow from "ui/editor/EditorRow";
import InputGroup from "ui/editor/InputGroup";
import InputLegend from "ui/editor/InputLegend";
import RichTextInput from "ui/editor/RichTextInput";
import Input, { Props as InputProps } from "ui/shared/Input";
import InputRow from "ui/shared/InputRow";
import InputRowItem from "ui/shared/InputRowItem";

import type { FlowSettings } from "../../../../types";
import { useStore } from "../../lib/store";

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
      <Box mb={2} display="flex" alignItems="center">
        <Switch {...switchProps} color="primary" />
        <Typography variant="h4" component="h5">
          {title}
        </Typography>
      </Box>
      <Box mb={2}>
        {description && <Typography variant="body2">{description}</Typography>}
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
  const flowSettings = useStore((state) => state.flowSettings);

  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const handleClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setIsAlertOpen(false);
  };

  const formik = useFormik<FlowSettings>({
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
      await useStore.getState().updateFlowSettings(values);
      setIsAlertOpen(true);
    },
    validate: () => {},
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <EditorRow>
        <Typography variant="h2" component="h3" gutterBottom>
          Elements
        </Typography>
        <Typography variant="body1">
          Manage the features that users will be able to see
        </Typography>
      </EditorRow>
      <EditorRow background>
        <TextInput
          title="Legal Disclaimer"
          description="Displayed before a user submits their application"
          switchProps={{
            name: "elements.legalDisclaimer.show",
            checked: formik.values.elements?.legalDisclaimer?.show,
            onChange: formik.handleChange,
          }}
          headingInputProps={{
            name: "elements.legalDisclaimer.heading",
            value: formik.values.elements?.legalDisclaimer?.heading,
            onChange: formik.handleChange,
          }}
          contentInputProps={{
            name: "elements.legalDisclaimer.content",
            value: formik.values.elements?.legalDisclaimer?.content,
            onChange: formik.handleChange,
          }}
        />
      </EditorRow>
      <EditorRow background>
        <InputGroup flowSpacing>
          <InputLegend>Footer Links</InputLegend>
          <InputRow>
            <TextInput
              title="Help Page"
              richText
              description="A place to communicate FAQs, useful tips, or contact information"
              switchProps={{
                name: "elements.help.show",
                checked: formik.values.elements?.help?.show,
                onChange: formik.handleChange,
              }}
              headingInputProps={{
                name: "elements.help.heading",
                value: formik.values.elements?.help?.heading,
                onChange: formik.handleChange,
              }}
              contentInputProps={{
                name: "elements.help.content",
                value: formik.values.elements?.help?.content,
                onChange: formik.handleChange,
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
                checked: formik.values.elements?.privacy?.show,
                onChange: formik.handleChange,
              }}
              headingInputProps={{
                name: "elements.privacy.heading",
                value: formik.values.elements?.privacy?.heading,
                onChange: formik.handleChange,
              }}
              contentInputProps={{
                name: "elements.privacy.content",
                value: formik.values.elements?.privacy?.content,
                onChange: formik.handleChange,
              }}
            />
          </InputRow>
        </InputGroup>
      </EditorRow>
      <EditorRow>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={!formik.dirty}
        >
          Update elements
        </Button>
      </EditorRow>
      <Snackbar
        open={isAlertOpen}
        autoHideDuration={6000}
        onClose={handleClose}
      >
        <Alert onClose={handleClose} severity="success" sx={{ width: "100%" }}>
          Service settings updated successfully
        </Alert>
      </Snackbar>
    </form>
  );
};

export default ServiceSettings;
