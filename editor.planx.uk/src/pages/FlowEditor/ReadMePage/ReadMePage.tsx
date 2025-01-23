import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { TextInputType } from "@planx/components/TextInput/model";
import { useFormik } from "formik";
import { useToast } from "hooks/useToast";
import capitalize from "lodash/capitalize.js";
import React, { useState } from "react";
import FlowTag, { FlowTagType, StatusVariant } from "ui/editor/FlowTag";
import InputGroup from "ui/editor/InputGroup";
import InputLegend from "ui/editor/InputLegend";
import RichTextInput from "ui/editor/RichTextInput/RichTextInput";
import SettingsDescription from "ui/editor/SettingsDescription";
import SettingsSection from "ui/editor/SettingsSection";
import { CharacterCounter } from "ui/shared/CharacterCounter";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";
import { Switch } from "ui/shared/Switch";
import { object, string } from "yup";

import { ExternalPortals } from "../components/Sidebar/Search/ExternalPortalList/ExternalPortals";
import { useStore } from "../lib/store";
import { FlowInformation } from "../utils";

export interface ReadMePageProps {
  flowSlug: string;
  flowInformation: FlowInformation;
  teamSlug: string;
}

interface ReadMePageForm {
  serviceSummary: string;
  serviceDescription: string;
  serviceLimitations: string;
}

export const ReadMePage: React.FC<ReadMePageProps> = ({
  flowSlug,
  flowInformation,
  teamSlug,
}) => {
  const { status: flowStatus } = flowInformation;
  const [
    flowDescription,
    updateFlowDescription,
    flowSummary,
    updateFlowSummary,
    flowLimitations,
    updateFlowLimitations,
    externalPortals,
  ] = useStore((state) => [
    state.flowDescription,
    state.updateFlowDescription,
    state.flowSummary,
    state.updateFlowSummary,
    state.flowLimitations,
    state.updateFlowLimitations,
    state.externalPortals,
  ]);

  const toast = useToast();

  const hasExternalPortals = Boolean(Object.keys(externalPortals).length);

  const [showExternalPortals, setShowExternalPortals] = useState(false);

  const formik = useFormik<ReadMePageForm>({
    initialValues: {
      serviceSummary: flowSummary || "",
      serviceDescription: flowDescription || "",
      serviceLimitations: flowLimitations || "",
    },
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      try {
        const updateFlowDescriptionPromise = updateFlowDescription(
          values.serviceDescription
        );
        const updateFlowSummaryPromise = updateFlowSummary(
          values.serviceSummary
        );

        const updateFlowLimitationsPromise = updateFlowLimitations(
          values.serviceLimitations
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
              "Unable to update the flow description. Please try again."
            );
          }
          if (!summaryResult) {
            setFieldError(
              "serviceSummary",
              "Unable to update the service summary. Please try again."
            );
          }
          if (!limitationsResult) {
            setFieldError(
              "serviceLimitations",
              "Unable to update the service limitations. Please try again."
            );
          }
          throw new Error("One or more updates failed");
        }
      } catch (error) {
        console.error("Error updating descriptions:", error);
        toast.error(
          "An error occurred while updating descriptions. Please try again."
        );
      } finally {
        setSubmitting(false);
      }
    },
    validateOnBlur: false,
    validateOnChange: false,
    validationSchema: object({
      serviceSummary: string().max(
        120,
        "Service description must be 120 characters or less"
      ),
    }),
  });

  return (
    <Container maxWidth="formWrap">
      <SettingsSection>
        <Typography variant="h2" component="h3" gutterBottom>
          {capitalize(flowSlug.replaceAll("-", " "))}
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
            <InputLegend>Service description</InputLegend>
            <SettingsDescription>
              <>A short blurb on what this service is.</>
            </SettingsDescription>
            <Input
              multiline
              {...formik.getFieldProps("serviceSummary")}
              id="serviceSummary"
              placeholder="Description"
              errorMessage={formik.errors.serviceSummary}
              disabled={!useStore.getState().canUserEditTeam(teamSlug)}
              inputProps={{
                "aria-describedby": "A short blurb on what this service is.",
                "aria-label": "Service Description",
              }}
            />
            <CharacterCounter
              count={formik.values.serviceSummary.length}
              textInputType={TextInputType.Short} // 120 characters
              error={Boolean(formik.errors.serviceSummary)}
            />
          </InputGroup>
          <InputGroup flowSpacing>
            <InputLegend>What does this service do?</InputLegend>
            <SettingsDescription>
              <>
                A longer description of the service. <br />
                <br /> How should the service be used? What does it include? Are
                there are any dependencies related to this service?
              </>
            </SettingsDescription>
            <InputRow>
              <RichTextInput
                disabled={!useStore.getState().canUserEditTeam(teamSlug)}
                inputProps={{
                  "aria-describedby": "A longer description of the service.",
                }}
                {...formik.getFieldProps("serviceDescription")}
                id="serviceDescription"
                placeholder="The service..."
                errorMessage={formik.errors.serviceDescription}
              />
            </InputRow>
          </InputGroup>
          <InputGroup flowSpacing>
            <InputLegend>Limitations of the service</InputLegend>
            <SettingsDescription>
              <>What does this service not include?</>
            </SettingsDescription>
            <InputRow>
              <RichTextInput
                disabled={!useStore.getState().canUserEditTeam(teamSlug)}
                inputProps={{
                  "aria-describedby": "What does this service not include",
                }}
                {...formik.getFieldProps("serviceLimitations")}
                id="serviceLimitations"
                errorMessage={formik.errors.serviceLimitations}
                placeholder="Limitations"
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
              disabled={
                !formik.dirty
              }
              color="secondary"
              sx={{ ml: 1.5 }}
            >
              Reset changes
            </Button>
          </Box>
        </form>
      </SettingsSection>
      <Box pt={2}>
        <Switch
          label={"Show external portals"}
          name={"service.status"}
          variant="editorPage"
          checked={showExternalPortals}
          onChange={() => setShowExternalPortals(!showExternalPortals)}
        />
        {hasExternalPortals && showExternalPortals && (
          <Box pt={2} data-testid="searchExternalPortalList">
            <InputLegend>External Portals</InputLegend>
            <Typography variant="body1" my={2}>
              Your service contains the following external portals:
            </Typography>
            <ExternalPortals externalPortals={externalPortals} />
          </Box>
        )}
      </Box>
    </Container>
  );
};
