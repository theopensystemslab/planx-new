import { useMutation } from "@apollo/client";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import MenuItem from "@mui/material/MenuItem";
import { SelectChangeEvent } from "@mui/material/Select";
import Typography from "@mui/material/Typography";
import {
  ComponentType as TYPES,
  SendIntegration,
} from "@opensystemslab/planx-core/types";
import { useFormikWithRef } from "@planx/components/shared/useFormikWithRef";
import { getIn } from "formik";
import { hasFeatureFlag } from "lib/featureFlags";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { useEffect } from "react";
import { ModalFooter } from "ui/editor/ModalFooter";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import { TemplatedNodeInstructions } from "ui/editor/TemplatedNodeInstructions";
import ErrorWrapper from "ui/shared/ErrorWrapper";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";
import SelectInput from "ui/shared/SelectInput/SelectInput";
import { Switch } from "ui/shared/Switch";

import { ICONS } from "../shared/icons";
import { WarningContainer } from "../shared/Preview/WarningContainer";
import { EditorProps } from "../shared/types";
import { useFlowEmailId } from "./hooks/useFlowEmailId";
import { useTeamSubmissionIntegrations } from "./hooks/useGetTeamSubmissionIntegrations";
import { useInsertFlowIntegration } from "./hooks/useInsertFlowIntegrations";
import { useUpdateFlowIntegration } from "./hooks/useUpdateFlowIntegration";
import { parseSend, Send, validationSchema } from "./model";

export type Props = EditorProps<TYPES.Send, Send>;

const SendComponent: React.FC<Props> = (props) => {
  const formik = useFormikWithRef<Send>(
    {
      initialValues: parseSend(props.node?.data),
      onSubmit: (newValues) => {
        if (props.handleSubmit) {
          props.handleSubmit({ type: TYPES.Send, data: newValues });
        }
      },
      validationSchema,
    },
    props.formikRef,
  );

  const [teamSlug, teamId, flowSlug, id, submissionEmail] = useStore(
    (state) => [
      state.teamSlug,
      state.teamId,
      state.flowSlug,
      state.id,
      state.teamSettings.submissionEmail,
    ],
  );

  const flowEmailIdObject = useFlowEmailId(id);
  const {
    data: flowData,
    loading: flowLoading,
    error: flowError,
  } = flowEmailIdObject;
  const emailId = flowData?.flowIntegrations?.[0]?.emailId;

  const teamSubmissionIntegrationsObject =
    useTeamSubmissionIntegrations(teamId);
  const { data, loading, error } = teamSubmissionIntegrationsObject;
  const emailOptions = data?.submissionIntegrations || [];
  const defaultEmail = emailOptions.find((email: any) => email.defaultEmail);

  const insertFlowIntegrationObject = useInsertFlowIntegration();
  const [insertFlowIntegration] = insertFlowIntegrationObject;
  useEffect(() => {
    const populateDefaultEmail = async () => {
      if (!emailId && defaultEmail) {
        await insertFlowIntegration({
          variables: {
            flowId: id,
            emailId: defaultEmail.id,
            teamId: teamId,
          },
        });
      }
    };

    populateDefaultEmail();
  }, [emailId, defaultEmail, id, teamId, insertFlowIntegration]);

  useEffect(() => {
    if (!formik.values.submissionEmail && defaultEmail) {
      formik.setFieldValue("submissionEmail", defaultEmail.id);
    }
  }, [formik, defaultEmail]);

  const updateFlowIntegrationObject = useUpdateFlowIntegration();
  const [updateFlowIntegration] = updateFlowIntegrationObject;

  const handleChangeEmail = async (newEmailId: string) => {
    if (emailId) {
      await updateFlowIntegration({
        variables: {
          flowId: id,
          emailId: newEmailId,
        },
      });
    }
  };

  const handleSelectChange = (event: SelectChangeEvent<unknown>) => {
    const selectedValue = event.target.value as string;
    formik.setFieldValue("submissionEmail", selectedValue);
    handleChangeEmail(selectedValue);
  };

  const currentEmail = emailOptions.find((email) => email.id === emailId);

  const toggleSwitch = (value: SendIntegration) => {
    let newCheckedValues: SendIntegration[];

    // Remove or append this value from the existing array of destinations
    if (formik.values.destinations.includes(value)) {
      newCheckedValues = formik.values.destinations.filter((x) => x !== value);
    } else {
      newCheckedValues = [...formik.values.destinations, value];
    }

    formik.setFieldValue("destinations", newCheckedValues.sort());
  };

  return (
    <form onSubmit={formik.handleSubmit} id="modal">
      <TemplatedNodeInstructions
        isTemplatedNode={formik.values.isTemplatedNode}
        templatedNodeInstructions={formik.values.templatedNodeInstructions}
        areTemplatedNodeInstructionsRequired={
          formik.values.areTemplatedNodeInstructionsRequired
        }
      />
      <ModalSection>
        <ModalSectionContent title="Send" Icon={ICONS[TYPES.Send]}>
          <InputRow>
            <Input
              format="large"
              name="title"
              value={formik.values.title}
              placeholder="Editor title"
              onChange={formik.handleChange}
              disabled={props.disabled}
              errorMessage={formik.errors.title}
            />
          </InputRow>
        </ModalSectionContent>
      </ModalSection>
      <ModalSection>
        <ErrorWrapper error={getIn(formik.errors, "destinations")}>
          <>
            <ModalSectionContent title={"Back Office Planning System"}>
              <InputRow>
                <Switch
                  checked={formik.values.destinations.includes("bops")}
                  onChange={() => toggleSwitch("bops")}
                  label={`Send to BOPS ${
                    import.meta.env.VITE_APP_ENV === "production"
                      ? "production"
                      : "staging"
                  }`}
                  disabled={props.disabled}
                />
              </InputRow>
            </ModalSectionContent>
            <Divider />
            <ModalSectionContent title={"Email"}>
              <InputRow>
                <Switch
                  checked={formik.values.destinations.includes("email")}
                  onChange={() => toggleSwitch("email")}
                  label={`Send to ${submissionEmail || "your inbox"}`}
                  disabled={props.disabled}
                />
              </InputRow>
              {hasFeatureFlag("MULTIPLE_SUBMISSION_SEND_COMPONENT") ? (
                <>
                  <InputRow>
                    {formik.values.destinations.includes("email") && (
                      <>
                        {loading || flowLoading ? (
                          <Typography variant="body2">
                            Loading email options...
                          </Typography>
                        ) : (
                          <>
                            {error || flowError ? (
                              <Typography variant="body2" color="error">
                                Failed to load email options.
                              </Typography>
                            ) : (
                              <SelectInput
                                name="submissionEmail"
                                value={
                                  formik.values.submissionEmail ||
                                  currentEmail?.id ||
                                  ""
                                }
                                onChange={handleSelectChange}
                                bordered
                                disabled={props.disabled}
                              >
                                {emailOptions.map((email: any) => (
                                  <MenuItem key={email.id} value={email.id}>
                                    {email.submissionEmail}
                                  </MenuItem>
                                ))}
                              </SelectInput>
                            )}
                          </>
                        )}
                      </>
                    )}
                  </InputRow>
                </>
              ) : (
                <></>
              )}
            </ModalSectionContent>
            <Divider />
            <ModalSectionContent title={"Microsoft SharePoint"}>
              <InputRow>
                <Switch
                  checked={formik.values.destinations.includes("s3")}
                  onChange={() => toggleSwitch("s3")}
                  label="Send to Microsoft SharePoint"
                  disabled={props.disabled}
                />
              </InputRow>
              <Typography variant="body2">
                Receive submissions in MS SharePoint via a Power Automate
                workflow. This option requires you to host a Power Automate
                webhook that can receive notifications of new submissions in
                real-time. Learn more about this option in our{" "}
                <Link
                  href="https://opensystemslab.notion.site/How-you-can-receive-process-PlanX-applications-using-Microsoft-365-tools-like-Power-Automate-13197a4bbd24421eaf7b5021ddd07741?pvs=74"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  resources
                </Link>
                .
              </Typography>
            </ModalSectionContent>
            <Divider />
            <ModalSectionContent title={"FME Workbench"}>
              <InputRow>
                <Switch
                  checked={formik.values.destinations.includes("fme")}
                  onChange={() => toggleSwitch("fme")}
                  label="Retrieve using FME Workbench"
                  disabled={props.disabled}
                />
              </InputRow>
              <Typography variant="body2">
                Retrieve submissions using FME Workbench to download to your
                local network. This option requires you to setup a workflow
                which polls for new submissions on a schedule of your choice.
              </Typography>
            </ModalSectionContent>
            <Divider />
            <ModalSectionContent title={"Uniform"}>
              <InputRow>
                <Switch
                  checked={formik.values.destinations.includes("uniform")}
                  onChange={() => toggleSwitch("uniform")}
                  label={`Send to Uniform ${
                    import.meta.env.VITE_APP_ENV === "production"
                      ? "production"
                      : "staging"
                  }`}
                  disabled={
                    props.disabled ||
                    !["buckinghamshire", "lambeth", "southwark"].includes(
                      teamSlug,
                    )
                  }
                />
              </InputRow>
              <Typography variant="body2">
                This is a legacy integration with limited support. It is only
                available for specific councils and suitable for use with Lawful
                Development Certificate applications (existing and proposed).
              </Typography>
            </ModalSectionContent>
          </>
        </ErrorWrapper>
        <ModalSectionContent>
          <WarningContainer>
            <FactCheckIcon />
            <Typography variant="body2" ml={2}>
              Records of submissions can be viewed in the{" "}
              <Link
                href={`/${teamSlug}/${flowSlug}/submissions`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Submissions
              </Link>{" "}
              log in the left-hand menu. Editors can download successful
              submissions within 28 days from receipt.
            </Typography>
          </WarningContainer>
        </ModalSectionContent>
      </ModalSection>
      <ModalFooter formik={formik} showMoreInformation={false} />
    </form>
  );
};

export default SendComponent;
