import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import FormControlLabel, {
  formControlLabelClasses,
} from "@mui/material/FormControlLabel";
import Snackbar from "@mui/material/Snackbar";
import Switch, { SwitchProps } from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import { FlowStatus } from "@opensystemslab/planx-core/types";
import { useFormik } from "formik";
import React, { useState } from "react";
import { FONT_WEIGHT_BOLD } from "theme";
import InputGroup from "ui/editor/InputGroup";
import InputLegend from "ui/editor/InputLegend";
import RichTextInput from "ui/editor/RichTextInput";
import SettingsDescription from "ui/editor/SettingsDescription";
import SettingsSection from "ui/editor/SettingsSection";
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
  const [flowSettings, updateFlowSettings, flowStatus, updateFlowStatus] =
    useStore((state) => [
      state.flowSettings,
      state.updateFlowSettings,
      state.flowStatus,
      state.updateFlowStatus,
    ]);

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
      setIsAlertOpen(true);
    },
    validate: () => {},
  });

  const statusForm = useFormik<{ status: FlowStatus }>({
    initialValues: {
      status: flowStatus || "online",
    },
    onSubmit: async (values, { resetForm }) => {
      const isSuccess = await updateFlowStatus(values.status);
      if (isSuccess) {
        setIsAlertOpen(true);
        // Reset "dirty" status to disable Save & Reset buttons
        resetForm({ values });
      }
    },
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
      <Box component="form" onSubmit={statusForm.handleSubmit}>
        <SettingsSection>
          <Typography variant="h2" component="h3" gutterBottom>
            Status
          </Typography>
          <Typography variant="body1">
            Manage the status of your service.
          </Typography>
        </SettingsSection>
        <SettingsSection background>
          <FormControlLabel
            label={statusForm.values.status}
            sx={{
              margin: 0,
              marginBottom: 0.5,
              [`& .${formControlLabelClasses.label}`]: {
                fontWeight: FONT_WEIGHT_BOLD,
                textTransform: "capitalize",
                fontSize: 19,
              },
            }}
            control={
              <Switch
                name="service.status"
                color="primary"
                checked={statusForm.values.status === "online"}
                onChange={() =>
                  statusForm.setFieldValue(
                    "status",
                    statusForm.values.status === "online"
                      ? "offline"
                      : "online",
                  )
                }
              />
            }
          />
          <SettingsDescription>
            <p>Toggle your service between "offline" and "online".</p>
            <p>
              A service must be online to be accessed by the public, and to
              enable analytics gathering.
            </p>
            <p>Offline services can still be edited and published as normal.</p>
          </SettingsDescription>
          <Box>
            <Button
              type="submit"
              variant="contained"
              disabled={!statusForm.dirty}
            >
              Save
            </Button>
            <Button
              onClick={() => statusForm.resetForm()}
              type="reset"
              variant="contained"
              disabled={!statusForm.dirty}
              color="secondary"
              sx={{ ml: 1.5 }}
            >
              Reset changes
            </Button>
          </Box>
        </SettingsSection>
      </Box>
      <Snackbar
        open={isAlertOpen}
        autoHideDuration={6000}
        onClose={handleClose}
      >
        <Alert onClose={handleClose} severity="success" sx={{ width: "100%" }}>
          Service settings updated successfully
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ServiceSettings;
