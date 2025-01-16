import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { useFormik } from "formik";
import { useToast } from "hooks/useToast";
import capitalize from "lodash/capitalize.js";
import React from "react";
import InputGroup from "ui/editor/InputGroup";
import InputLegend from "ui/editor/InputLegend";
import RichTextInput from "ui/editor/RichTextInput/RichTextInput";
import SettingsDescription from "ui/editor/SettingsDescription";
import SettingsSection from "ui/editor/SettingsSection";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";

import { useStore } from "../lib/store";
import { FlowInformation } from "../utils";

interface ReadMePageProps {
  flowSlug: string;
  flowInformation: FlowInformation;
}

interface ReadMePageForm {
  serviceSummary: string;
  serviceDescription: string;
  // serviceLimitations: string;
}

export const ReadMePage: React.FC<ReadMePageProps> = ({
  flowSlug,
  flowInformation,
}) => {
  const { status: flowStatus } = flowInformation;
  const [
    flowDescription,
    updateFlowDescription,
    flowSummary,
    updateFlowSummary,
  ] = useStore((state) => [
    state.flowDescription,
    state.updateFlowDescription,
    state.flowSummary,
    state.updateFlowSummary,
  ]);

  const toast = useToast();

  const formik = useFormik<ReadMePageForm>({
    initialValues: {
      serviceSummary: flowSummary || "",
      serviceDescription: flowDescription || "",
    },
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      // TODO: handle changes to any field, not just description

      try {
        const updateFlowDescriptionPromise = updateFlowDescription(
          values.serviceDescription,
        );
        const updateFlowSummaryPromise = updateFlowSummary(
          values.serviceSummary,
        );

        const [descriptionResult, summaryResult] = await Promise.all([
          updateFlowDescriptionPromise,
          updateFlowSummaryPromise,
        ]);

        if (descriptionResult && summaryResult) {
          toast.success("Updated successfully");
        } else {
          if (!descriptionResult) {
            setFieldError(
              "serviceDescription",
              "Unable to update the flow description. Please try again.",
            );
          }
          if (!summaryResult) {
            setFieldError(
              "serviceSummary",
              "Unable to update the service summary. Please try again.",
            );
          }
          throw new Error("One or more updates failed");
        }
      } catch (error) {
        console.error("Error updating descriptions:", error);
        toast.error(
          "An error occurred while updating descriptions. Please try again.",
        );
      } finally {
        setSubmitting(false);
      }
    },
    validateOnBlur: false,
    validateOnChange: false,
    // enableReinitialize: true,
    // validationSchema: object({
    //   checked: checklistValidationSchema(props), // character limit?
    // }),
  });

  return (
    <Container maxWidth="contentWrap">
      <SettingsSection>
        <Typography variant="h2" component="h3" gutterBottom>
          {capitalize(flowSlug.replaceAll("-", " "))}
        </Typography>

        {/* TODO: get rid of Box width */}
        <Box display={"flex"} justifyContent={"space-between"} width={300}>
          <Chip
            label={capitalize(flowStatus)}
            color={flowStatus === "online" ? "success" : "error"}
          />
          {/* <Chip
            label={isFlowPublished ? "Published" : "Unpublished"}
            color={isFlowPublished ? "success" : "error"}
          /> */}
          <Chip label="Submission" color="primary" />
          <Chip label="Discretionary" color="info" />
        </Box>
      </SettingsSection>
      <SettingsSection>
        <form onSubmit={formik.handleSubmit}>
          <InputGroup flowSpacing>
            <InputLegend>Service Description</InputLegend>
            <SettingsDescription>
              <>
                A short blurb on what this service is, how it should be used,
                and if there are any dependencies related to this service.
              </>
            </SettingsDescription>
            <Input
              multiline
              {...formik.getFieldProps("serviceSummary")}
              // value={formik.values.serviceSummary}
              // onChange={formik.handleChange}
              // name="serviceSummary"
              id="serviceSummary"
              placeholder="Description"
              errorMessage={formik.errors.serviceSummary}
            />
          </InputGroup>
          <InputGroup flowSpacing>
            <InputLegend>What does this service do?</InputLegend>
            <SettingsDescription>
              <>For example, what does the service include?</>
            </SettingsDescription>
            <InputRow>
              <RichTextInput
                {...formik.getFieldProps("serviceDescription")}
                id="serviceDescription"
                placeholder="The service..."
                // onChange={formik.handleChange}
                // name="serviceDescription"
                // value={formik.values.serviceDescription}
                errorMessage={formik.errors.serviceDescription}
              />
            </InputRow>
          </InputGroup>
          <InputGroup flowSpacing>
            <InputLegend>Limitations of the Service</InputLegend>
            <SettingsDescription>
              <>What does this flow not include?</>
            </SettingsDescription>
            <InputRow>
              <RichTextInput
                name="Service limitations"
                placeholder="Limitations"
                onChange={formik.handleChange}
                // value={formik.values.serviceLimitations}
              />
            </InputRow>
          </InputGroup>

          <Box>
            <Button type="submit" variant="contained">
              Save
            </Button>
            <Button
              onClick={() => {}}
              type="reset"
              variant="contained"
              color="secondary"
              sx={{ ml: 1.5 }}
            >
              Reset changes
            </Button>
          </Box>
        </form>
      </SettingsSection>
    </Container>
  );
};
