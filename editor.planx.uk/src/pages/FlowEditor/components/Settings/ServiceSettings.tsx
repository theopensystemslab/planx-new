import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Switch, { SwitchProps } from "@material-ui/core/Switch";
import Typography from "@material-ui/core/Typography";
import { useFormik } from "formik";
import React from "react";
import { useCurrentRoute } from "react-navi";
import Input, { Props as InputProps } from "ui/Input";
import InputGroup from "ui/InputGroup";
import InputRow from "ui/InputRow";
import InputRowItem from "ui/InputRowItem";

import type { FlowSettings } from "../../../../types";
import { useStore } from "../../lib/store";

const TextInput: React.FC<{
  title: string;
  description?: string;
  switchProps?: SwitchProps;
  headingInputProps?: InputProps;
  contentInputProps?: InputProps;
}> = ({
  title,
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
          <Input placeholder="Text" multiline rows={6} {...contentInputProps} />
        </InputRowItem>
      </InputRow>
    </Box>
  );
};

interface Props {
  settings?: FlowSettings;
}

const ServiceSettings: React.FC<Props> = (props) => {
  const { data } = useCurrentRoute();

  const formik = useFormik<FlowSettings>({
    initialValues: {
      elements: {
        privacy: {
          heading: props.settings?.elements?.privacy?.heading ?? "",
          content: props.settings?.elements?.privacy?.content ?? "",
          show: props.settings?.elements?.privacy?.show ?? false,
        },
        help: {
          heading: props.settings?.elements?.help?.heading ?? "",
          content: props.settings?.elements?.help?.content ?? "",
          show: props.settings?.elements?.help?.show ?? false,
        },
        legalDisclaimer: {
          heading: props.settings?.elements?.legalDisclaimer?.heading ?? "",
          content: props.settings?.elements?.legalDisclaimer?.content ?? "",
          show: props.settings?.elements?.legalDisclaimer?.show ?? false,
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
      <Box pt={2}>
        <InputGroup>
          <TextInput
            title="Help Page"
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
