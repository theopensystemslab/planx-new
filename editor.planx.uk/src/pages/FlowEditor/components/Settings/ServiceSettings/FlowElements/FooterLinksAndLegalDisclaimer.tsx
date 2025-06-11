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
  const [flowStatus, flowSettings, updateFlowSettings, setFlowSettings] =
    useStore((state) => [
      state.flowStatus,
      state.flowSettings,
      state.updateFlowSettings,
      state.setFlowSettings,
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
          heading: flowSettings?.elements?.privacy?.heading ?? "Privacy notice",
          content:
            flowSettings?.elements?.privacy?.content ?? DEFAULT_PRIVACY_NOTICE,
          show: flowSettings?.elements?.privacy?.show ?? false,
        },
      },
    },
    onSubmit: async (values, { resetForm }) => {
      await updateFlowSettings(values);
      setFlowSettings(values);
      toast.success("Service settings updated successfully");
      resetForm({ values });
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
              description="Your privacy policy. If you use the template notice, update the placeholders with your council's information."
              switchProps={{
                name: "elements.privacy.show",
                checked: elementsForm.values.elements?.privacy?.show,
                onChange: (e) => {
                  if (flowStatus === "online") {
                    toast.error(
                      "You cannot disable the privacy page for a service that is online",
                    );
                    return;
                  }
                  elementsForm.handleChange(e);
                },
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

const DEFAULT_PRIVACY_NOTICE =
  "<p>This privacy notice explains how we <strong>[Council Name]</strong> collect and use your personal data when you use our online planning services.</p><p>We are the data controller for the personal data you provide through our planning services.</p><p>You can read our full council privacy policy here: <strong>[Link to general council privacy policy]</strong>.</p><h1>What we collect from guidance services!</h1><p>In the case of guidance services that do not involve sending anything to us, we do not collect or retain any personal information unless you provide feedback.</p><h1>What we collect from submission services</h1><p>When you use our services to submit, for example, a planning application, we may collect personal and sensitive information, including:</p><ul><li><strong>Contact details</strong> (name, address, email, phone)</li><li><strong>Property address</strong> The address that your enquiry or application is about</li><li><strong>Planning application details</strong> (including documents and plans you upload)</li><li><strong>Comments or representations</strong> you submit</li><li><strong>Payment details</strong>, where applicable (processed by a secure third-party provider)</li></ul><p>We collect this data to:</p><ul><li>Deliver our planning services</li><li>Contact you about your application or comment</li><li>Publish required information as part of the statutory planning process and reporting requirements, when appropriate</li><li>Improve and secure this service and other future services we deliver</li></ul><h1>When you provide feedback</h1><p>If you use the in-service feedback tool to tell us how you found the service, or to report an issue, we may retain the following sensitive information:</p><ul><li><strong>Property address</strong> (The address of the property you are enquiring about)</li></ul><p>We collect this data only in order to allow us to investigate any issues you have reported so we can improve the service. We do not use this information for any other purpose.</p><p><strong>When submitting feedback, please do not include any personal data such as your name, email or address in your feedback.</strong> In the event that you do include personal data, we will treat this information in line with our general privacy policy. In general, we will remove this information from your feedback as soon as possible.</p><h1>What's our legal basis?</h1><p>We process your data under:</p><ul><li><strong>Public task</strong> - to carry out our duties under planning law</li><li><strong>Legal obligation</strong> - where the law requires us to keep or publish certain information</li><li><strong>Consent</strong> - if you opt in to updates or additional services</li></ul><h1>Who we share your data with</h1><p>We share this data with:</p><ul><li>Our staff</li><li>Our subcontractors and suppliers, including organisations helping us deliver our services, and teams providing software and support services to us. In these cases there will always be data protection agreements in place to ensure your information is protected and only used for the purposes described here.</li></ul><p>Some information (like planning applications) may be published on our planning register, as required by law.</p><p>We may also share data with:</p><ul><li>Statutory consultees (e.g. Environment Agency, Historic England)</li><li>Other council departments or government bodies</li></ul><p>We don’t sell your data or use it for marketing.</p><h1>How long we keep it</h1><p>We keep your data only for as long as necessary to meet legal or service requirements. Feedback is automatically deleted after 6 months or less.</p><p>Planning applications form part of the public record and may be kept permanently.</p><h1>Your rights</h1><p>You have rights over your personal data, including:</p><ul><li>To ask for a copy</li><li>To correct inaccurate information</li><li>In some cases, to object to or restrict processing</li></ul><p>To find out more or exercise your rights, contact <strong>[Council email address]</strong>.</p>";
