import { ApolloQueryResult } from "@apollo/client/core/types";
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
import { FormikProps } from "formik";
import { hasFeatureFlag } from "lib/featureFlags";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useState } from "react";
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
import { ValidationError } from "yup";

import { SubmissionEmailInput } from "../../../../src/pages/FlowEditor/components/Settings/Team/Integrations/SubmissionEmails/types";
import { ICONS } from "../shared/icons";
import { WarningContainer } from "../shared/Preview/WarningContainer";
import { EditorProps } from "../shared/types";
import { useFlowEmailId } from "./hooks/useFlowEmailId";
import { useTeamSubmissionIntegrations } from "./hooks/useGetTeamSubmissionIntegrations";
import { useInsertSubmissionIntegration } from "./hooks/useInsertSubmissionIntegration";
import { useUpdateFlowIntegration } from "./hooks/useUpdateFlowIntegration";
import { parseSend, Send, validationSchema } from "./model";
import { GetFlowEmailIdQuery } from "./types";

export type Props = EditorProps<TYPES.Send, Send>;

const SendComponent: React.FC<Props> = (props) => {
  const [isNewEmailSelected, setIsNewEmailSelected] = useState(false);
  const [newEmail, setNewEmail] = useState("");

  const [insertSubmissionIntegration] = useInsertSubmissionIntegration();
  const [updateFlowIntegration] = useUpdateFlowIntegration();

  const formik = useFormikWithRef<Send>(
    {
      initialValues: parseSend(props.node?.data),
      onSubmit: async (newValues) => {
        if (props.handleSubmit) {
          await handleUpdateEmail({
            formik,
            insertSubmissionIntegration,
            updateFlowIntegration,
            teamId,
            newValues,
            existingEmailId,
            id,
            refetchFlowData,
          });
          props.handleSubmit({ type: TYPES.Send, data: newValues });
        }
      },
      validate: async (values) => {
        try {
          await validationSchema.validate(values, {
            context: {
              existingEmails: emailOptions.map(
                (email: SubmissionEmailInput) => email.submissionEmail,
              ),
            },
          });
        } catch (error) {
          if (error instanceof ValidationError) {
            return { [error.path || "unknown"]: error.message };
          }
        }
      },
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

  const {
    data: flowData,
    loading: flowLoading,
    error: flowError,
    refetch: refetchFlowData,
  } = useFlowEmailId(id);

  const existingEmailId = flowData?.flowIntegrations?.[0]?.emailId;

  const { data, loading, error } = useTeamSubmissionIntegrations(teamId);
  const emailOptions = data?.submissionIntegrations || [];

  useEffect(() => {
    formik.setFieldValue("submissionEmailId", existingEmailId);
  }, [existingEmailId]);

  const currentEmail = emailOptions.find(
    (email) => email.id === existingEmailId,
  );

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
                  <Typography variant="body2" mb={2}>
                    You can only change or add submission emails from the Send
                    component. To manage, delete or update submission emails,
                    please visit your{" "}
                    <Link
                      href="#" // TODO: update link after routing work merged
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      team settings
                    </Link>{" "}
                    section.
                  </Typography>
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
                                  isNewEmailSelected
                                    ? "new-email"
                                    : formik.values.submissionEmailId ||
                                      currentEmail?.id ||
                                      ""
                                }
                                onChange={(event) =>
                                  handleSelectEmailChange(
                                    formik,
                                    event,
                                    setIsNewEmailSelected,
                                  )
                                }
                                bordered
                                disabled={props.disabled}
                              >
                                {emailOptions.map((email: any) => (
                                  <MenuItem key={email.id} value={email.id}>
                                    {email.submissionEmail}
                                  </MenuItem>
                                ))}
                                <MenuItem value="new-email">
                                  New email...
                                </MenuItem>
                              </SelectInput>
                            )}
                          </>
                        )}
                      </>
                    )}
                  </InputRow>
                  {isNewEmailSelected && (
                    <Input
                      name="newEmail"
                      value={newEmail}
                      placeholder="Enter new email"
                      onChange={(e) => {
                        setNewEmail(e.target.value);
                        formik.setFieldValue("newEmail", e.target.value);
                      }}
                      disabled={props.disabled}
                      errorMessage={formik.errors.newEmail}
                    />
                  )}
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

type HandleUpdateArgs = {
  formik: FormikProps<Send>;
  insertSubmissionIntegration: ReturnType<
    typeof useInsertSubmissionIntegration
  >[0];
  updateFlowIntegration: ReturnType<typeof useUpdateFlowIntegration>[0];
  teamId: number;
  newValues: Send;
  existingEmailId: string | undefined;
  id: string;
  refetchFlowData: () => Promise<ApolloQueryResult<GetFlowEmailIdQuery>>;
};

const handleUpdateEmail = async ({
  formik,
  insertSubmissionIntegration,
  updateFlowIntegration,
  teamId,
  newValues,
  existingEmailId,
  id,
  refetchFlowData,
}: HandleUpdateArgs) => {
  if (
    typeof formik.values.newEmail === "string" &&
    formik.values.newEmail !== ""
  ) {
    const { data: insertData, errors: insertErrors } =
      await insertSubmissionIntegration({
        variables: {
          teamId: teamId,
          submissionEmail: formik.values.newEmail,
          defaultEmail: false,
        },
      });

    if (insertErrors || !insertData?.insert_submission_integrations_one?.id) {
      throw new Error("Failed to insert new submission integration.");
    }

    const newEmailId = insertData.insert_submission_integrations_one.id;

    try {
      const { data: updateData, errors: updateErrors } =
        await updateFlowIntegration({
          variables: {
            flowId: id,
            emailId: newEmailId,
          },
        });

      if (
        updateErrors ||
        updateData?.update_flow_integrations?.affected_rows === 0
      ) {
        console.error("Failed to update flow integration:", updateErrors);
        throw new Error("Failed to update flow integration.");
      }

      const refetchedData = await refetchFlowData();
      if (refetchedData?.data?.flowIntegrations?.[0]?.emailId) {
        formik.setFieldValue(
          "submissionEmailId",
          refetchedData.data.flowIntegrations[0].emailId,
        );
      }
    } catch (error) {
      console.error("Error during updateFlowIntegration mutation:", error);
      throw error;
    }

    return;
  }

  if (
    existingEmailId &&
    newValues.submissionEmailId &&
    existingEmailId !== newValues.submissionEmailId
  ) {
    try {
      const { data: updateData, errors: updateErrors } =
        await updateFlowIntegration({
          variables: {
            flowId: id,
            emailId: newValues.submissionEmailId,
          },
        });

      if (
        updateErrors ||
        updateData?.update_flow_integrations?.affected_rows === 0
      ) {
        console.error("Failed to update flow integration:", updateErrors);
        throw new Error("Failed to update flow integration.");
      }

      const refetchedData = await refetchFlowData();
    } catch (error) {
      console.error("Error during updateFlowIntegration mutation:", error);
      throw error;
    }

    return;
  }
};

const handleSelectEmailChange = (
  formik: FormikProps<Send>,
  event: SelectChangeEvent<unknown>,
  setIsNewEmailSelected: React.Dispatch<React.SetStateAction<boolean>>,
) => {
  const selectedValue = event.target.value as string;

  if (selectedValue === "new-email") {
    setIsNewEmailSelected(true);
    formik.setFieldValue("submissionEmailId", "new-email");
  } else {
    setIsNewEmailSelected(false);
    formik.setFieldValue("submissionEmailId", selectedValue);
  }
};
