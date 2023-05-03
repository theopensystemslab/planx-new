import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Switch, { SwitchProps } from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import { useFormik } from "formik";
import React from "react";
import { useCurrentRoute } from "react-navi";
import Input, { Props as InputProps } from "ui/Input";
import InputGroup from "ui/InputGroup";
import InputRow from "ui/InputRow";
import InputRowItem from "ui/InputRowItem";
import RichTextInput from "ui/RichTextInput";

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
    <Box mb={2} width="100%">
      <Box my={2} display="flex" alignItems="center">
        <Switch {...switchProps} color="primary" />
        <Typography variant="h5">{title}</Typography>
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
  const { data } = useCurrentRoute();
  const flowSettings = useStore((state) => state.flowSettings);

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
    onSubmit: (values) => {
      useStore.getState().updateFlowSettings(data.team, data.flow, values);
    },
    validate: () => {},
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <Box py={3} borderBottom={1}>
        <Typography variant="h3" gutterBottom>
          <strong>Elements</strong>
        </Typography>
        <Typography variant="body1">
          Manage the features that users will be able to see
        </Typography>
      </Box>
      <Box borderBottom={1} pb={3}>
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
      </Box>
      <Box pt={2}>
        <Typography variant="h4">
          <strong>Footer Links</strong>
        </Typography>
        <InputGroup>
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
        </InputGroup>

        <Box py={2} justifyContent="flex-end" mb={4}>
          <Button type="submit" variant="contained" color="primary">
            Save
          </Button>
        </Box>
      </Box>
    </form>
  );
};

export default ServiceSettings;
