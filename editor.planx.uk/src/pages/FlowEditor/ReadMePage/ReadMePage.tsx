import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import SimpleExpand from "@planx/components/shared/Preview/SimpleExpand";
import { TEXT_LIMITS, TextInputType } from "@planx/components/TextInput/model";
import { useFormik } from "formik";
import { useToast } from "hooks/useToast";
import capitalize from "lodash/capitalize";
import React from "react";
import FlowTag from "ui/editor/FlowTag/FlowTag";
import { FlowTagType, StatusVariant } from "ui/editor/FlowTag/types";
import InputGroup from "ui/editor/InputGroup";
import InputLegend from "ui/editor/InputLegend";
import RichTextInput from "ui/editor/RichTextInput/RichTextInput";
import SettingsDescription from "ui/editor/SettingsDescription";
import SettingsSection from "ui/editor/SettingsSection";
import { CharacterCounter } from "ui/shared/CharacterCounter";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";
import { object, string } from "yup";

import { ExternalPortals } from "../components/Sidebar/Search/ExternalPortalList/ExternalPortals";
import { useStore } from "../lib/store";
import { ReadMePageForm, ReadMePageProps } from "./types";

export const ReadMePage: React.FC<ReadMePageProps> = ({
  flowInformation,
  teamSlug,
  flowSlug,
}) => {
  const characterCountLimit = TEXT_LIMITS[TextInputType.Short];
  const { status: flowStatus } = flowInformation;
  const [
    flowDescription,
    updateFlowDescription,
    flowSummary,
    updateFlowSummary,
    flowLimitations,
    updateFlowLimitations,
    externalPortals,
    flowName,
  ] = useStore((state) => [
    state.flowDescription,
    state.updateFlowDescription,
    state.flowSummary,
    state.updateFlowSummary,
    state.flowLimitations,
    state.updateFlowLimitations,
    state.externalPortals,
    state.flowName,
  ]);

  const toast = useToast();

  const hasExternalPortals = Boolean(Object.keys(externalPortals).length);

  const formik = useFormik<ReadMePageForm>({
    initialValues: {
      serviceSummary: flowSummary || "",
      serviceDescription: flowDescription || "",
      serviceLimitations: flowLimitations || "",
    },
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      try {
        const updateFlowDescriptionPromise = updateFlowDescription(
          values.serviceDescription,
        );
        const updateFlowSummaryPromise = updateFlowSummary(
          values.serviceSummary,
        );

        const updateFlowLimitationsPromise = updateFlowLimitations(
          values.serviceLimitations,
        );

        const [descriptionResult, summaryResult, limitationsResult] =
          await Promise.all([
            updateFlowDescriptionPromise,
            updateFlowSummaryPromise,
            updateFlowLimitationsPromise,
          ]);

        if (descriptionResult && summaryResult && limitationsResult) {
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
          if (!limitationsResult) {
            setFieldError(
              "serviceLimitations",
              "Unable to update the service limitations. Please try again.",
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
    validationSchema: object({
      serviceSummary: string().max(
        characterCountLimit,
        `Service description must be ${characterCountLimit} characters or less`,
      ),
    }),
  });

  return (
    <Container maxWidth="formWrap">
      <SettingsSection>
        <Typography variant="h2" component="h3" gutterBottom>
          {/* fallback from request params if store not populated with flowName */}
          {flowName || capitalize(flowSlug.replaceAll("-", " "))}
        </Typography>

        <Box display={"flex"}>
          <FlowTag
            tagType={FlowTagType.Status}
            statusVariant={
              flowStatus === "online"
                ? StatusVariant.Online
                : StatusVariant.Offline
            }
          >
            {flowStatus}
          </FlowTag>
        </Box>
      </SettingsSection>
      <SettingsSection background>
        <form onSubmit={formik.handleSubmit}>
          <InputGroup flowSpacing>
            <InputLegend id="serviceSummary-label">Service description</InputLegend>
            <SettingsDescription id="serviceSummary-description-text">
              A short blurb on what this service is.
            </SettingsDescription>
            <Input
              multiline
              {...formik.getFieldProps("serviceSummary")}
              id="serviceSummary"
              placeholder="Description"
              errorMessage={formik.errors.serviceSummary}
              disabled={!useStore.getState().canUserEditTeam(teamSlug)}
              inputProps={{
                "aria-describedby": "serviceSummary-description-text",
                "aria-labelledby": "serviceSummary-label",
              }}
            />
            <CharacterCounter
              count={formik.values.serviceSummary.length}
              limit={characterCountLimit}
              error={Boolean(formik.errors.serviceSummary)}
            />
          </InputGroup>
          <InputGroup flowSpacing>
            <InputLegend id="serviceDescription-label">What does this service do?</InputLegend>
            <SettingsDescription id="serviceDescription-description-text">
              <>
                A longer description of the service. <br />
                <br /> How should the service be used? What does it include? Are
                there are any dependencies related to this service?
              </>
            </SettingsDescription>
            <InputRow>
              <RichTextInput
                {...formik.getFieldProps("serviceDescription")}
                disabled={!useStore.getState().canUserEditTeam(teamSlug)}
                inputProps={{
                  "aria-describedby": "serviceDescription-description-text",
                  "aria-labelledby": "serviceDescription-label",
                }}
                id="serviceDescription"
                placeholder="The service..."
                multiline
                rows={6}
                errorMessage={formik.errors.serviceDescription}
              />
            </InputRow>
          </InputGroup>
          <InputGroup flowSpacing>
            <InputLegend id="serviceLimitations-label">Limitations of the service</InputLegend>
            <SettingsDescription id="serviceLimitations-description-text">
              <>What does this service not include?</>
            </SettingsDescription>
            <InputRow>
              <RichTextInput
                disabled={!useStore.getState().canUserEditTeam(teamSlug)}
                inputProps={{
                  "aria-describedby": "serviceLimitations-description-text",
                  "aria-labelledby": "serviceLimitations-label",
                }}
                {...formik.getFieldProps("serviceLimitations")}
                id="serviceLimitations"
                errorMessage={formik.errors.serviceLimitations}
                placeholder="Limitations"
                multiline
                rows={6}
              />
            </InputRow>
          </InputGroup>

          <Box>
            <Button
              type="submit"
              variant="contained"
              disabled={!useStore.getState().canUserEditTeam(teamSlug)}
            >
              Save
            </Button>
            <Button
              onClick={() => window.location.reload()}
              type="reset"
              variant="contained"
              disabled={!formik.dirty}
              color="secondary"
              sx={{ ml: 1.5 }}
            >
              Reset changes
            </Button>
          </Box>
        </form>
      </SettingsSection>
      <Box pt={2}>
        <SimpleExpand
          buttonText={{
            open: "Show external portals",
            closed: "Hide external portals",
          }}
          id="externalPortalsToggle"
        >
          <Box py={2}>
            {hasExternalPortals ? (
              <Box data-testid="searchExternalPortalList">
                <InputLegend>External Portals</InputLegend>
                <Typography variant="body1" my={2}>
                  Your service contains the following external portals:
                </Typography>
                <ExternalPortals externalPortals={externalPortals} />
              </Box>
            ) : (
              <Typography>This service has no external portals.</Typography>
            )}
          </Box>
        </SimpleExpand>
      </Box>
    </Container>
  );
};
