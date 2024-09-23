import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import FormControlLabel, {
  formControlLabelClasses,
} from "@mui/material/FormControlLabel";
import Link from "@mui/material/Link";
import Switch, { SwitchProps } from "@mui/material/Switch";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { FlowStatus } from "@opensystemslab/planx-core/types";
import axios from "axios";
import { useFormik } from "formik";
import { useToast } from "hooks/useToast";
import React, { useState } from "react";
import { rootFlowPath } from "routes/utils";
import { FONT_WEIGHT_BOLD } from "theme";
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

const CopyButton = (props: { link: string; isActive: boolean }) => {
  const [copyMessage, setCopyMessage] = useState<"copy" | "copied">("copy");
  return (
    <Tooltip title={copyMessage}>
      <Button
        disabled={!props.isActive}
        variant="help"
        onMouseLeave={() => {
          setTimeout(() => {
            setCopyMessage("copy");
          }, 500);
        }}
        onClick={() => {
          setCopyMessage("copied");
          navigator.clipboard.writeText(props.link);
        }}
        sx={{ marginLeft: 0.5 }}
      >
        <ContentCopyIcon style={{ width: "18px", height: "18px" }} />
        <Typography ml={0.5} variant="body3">
          {copyMessage}
        </Typography>
      </Button>
    </Tooltip>
  );
};

const TitledLink: React.FC<{
  link: string;
  isActive: boolean;
  helpText: string | undefined;
}> = ({ link, isActive, helpText }) => {
  return (
    <Box paddingBottom={0.5} mt={1}>
      <Typography mb={0.5} variant="h4">
        Your public link
        <CopyButton isActive={isActive} link={link} />
      </Typography>
      <SettingsDescription>
        <Typography variant="body2">{helpText}</Typography>
      </SettingsDescription>
      {isActive ? (
        <Link
          variant="body2"
          href={link}
          target={"_blank"}
          rel={"noopener noreferrer"}
        >
          {link}
        </Link>
      ) : (
        <Typography
          style={{ color: "GrayText", textDecoration: "underline" }}
          variant="body2"
        >
          {link}
        </Typography>
      )}
    </Box>
  );
};

const PublicLink: React.FC<{
  isFlowPublished: boolean;
  status: FlowStatus;
  subdomain: string;
  publishedLink: string;
}> = ({ isFlowPublished, status, subdomain, publishedLink }) => {
  const isFlowPublic = isFlowPublished && status === "online";
  const hasSubdomain = Boolean(subdomain);

  const publicLinkHelpText = () => {
    const isFlowOnline = status === "online";
    switch (true) {
      case isFlowPublished && isFlowOnline:
        return undefined;
      case !isFlowPublished && isFlowOnline:
        return "Publish your flow to activate the public link.";
      case isFlowPublished && !isFlowOnline:
        return "Switch your flow to 'online' to activate the public link.";
      case !isFlowPublished && !isFlowOnline:
        return "Publish your flow and switch it to 'online' to activate the public link.";
    }
  };

  switch (true) {
    case isFlowPublic && hasSubdomain:
      return (
        <TitledLink
          helpText={publicLinkHelpText()}
          isActive={true}
          link={subdomain}
        />
      );
    case isFlowPublic && !hasSubdomain:
      return (
        <TitledLink
          helpText={publicLinkHelpText()}
          isActive={true}
          link={publishedLink}
        />
      );
    case !isFlowPublic && hasSubdomain:
      return (
        <TitledLink
          helpText={publicLinkHelpText()}
          isActive={false}
          link={subdomain}
        />
      );
    case !isFlowPublic && !hasSubdomain:
      return (
        <TitledLink
          helpText={publicLinkHelpText()}
          isActive={false}
          link={publishedLink}
        />
      );
  }
};

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
    flowStatus,
    updateFlowStatus,
    token,
    teamSlug,
    flowSlug,
    teamDomain,
    isFlowPublished,
  ] = useStore((state) => [
    state.flowSettings,
    state.updateFlowSettings,
    state.flowStatus,
    state.updateFlowStatus,
    state.jwt,
    state.teamSlug,
    state.flowSlug,
    state.teamDomain,
    state.isFlowPublished,
  ]);
  const toast = useToast();

  const sendFlowStatusSlackNotification = async (status: FlowStatus) => {
    const skipTeamSlugs = [
      "open-digital-planning",
      "opensystemslab",
      "planx",
      "templates",
      "testing",
      "wikihouse",
    ];
    if (skipTeamSlugs.includes(teamSlug)) return;

    const emoji = {
      online: ":large_green_circle:",
      offline: ":no_entry:",
    };
    const message = `${emoji[status]} *${teamSlug}/${flowSlug}* is now ${status} (@Silvia)`;

    return axios.post(
      `${import.meta.env.VITE_APP_API_URL}/send-slack-notification`,
      {
        message: message,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
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
      toast.success("Service settings updated successfully");
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
        toast.success("Service settings updated successfully");
        // Send a Slack notification to #planx-notifications
        sendFlowStatusSlackNotification(values.status);
        // Reset "dirty" status to disable Save & Reset buttons
        resetForm({ values });
      }
    },
  });

  const publishedLink = `${window.location.origin}${rootFlowPath(
    false,
  )}/published`;

  const subdomainLink = teamDomain && `https://${teamDomain}/${flowSlug}`;

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

          <PublicLink
            isFlowPublished={isFlowPublished}
            status={flowStatus || "offline"}
            subdomain={subdomainLink}
            publishedLink={publishedLink}
          />

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
    </Container>
  );
};

export default ServiceSettings;
