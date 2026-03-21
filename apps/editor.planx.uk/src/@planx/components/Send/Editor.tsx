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
import { SubmissionEmailInput } from "pages/FlowEditor/components/Settings/Team/Integrations/SubmissionEmails/types";
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
import { ValidationError } from "yup";

import { ICONS } from "../shared/icons";
import { WarningContainer } from "../shared/Preview/WarningContainer";
import { EditorProps } from "../shared/types";
import { useFlowEmailId } from "./hooks/useFlowEmailId";
import { useTeamSubmissionIntegrations } from "./hooks/useGetTeamSubmissionIntegrations";
import { useInsertSubmissionIntegration } from "./hooks/useInsertSubmissionIntegration";
import { useUpdateFlowSubmissionEmail } from "./hooks/useUpdateFlowSubmissionEmail";
import { parseSend, Send, validationSchema } from "./model";
import {
  EmailEmptyStateProps,
  EmailSelectionProps,
} from "./types";

const EmailLoadingState: React.FC = () => (
  <Typography variant="body2">Loading email options...</Typography>
);

const EmailErrorState: React.FC = () => (
  <Typography variant="body2" color="error">
    Failed to load email options.
  </Typography>
);

const EmailEmptyState: React.FC<EmailEmptyStateProps> = ({
  teamSlug,
  error,
}) => (
  <ErrorWrapper error={error}>
    <Typography variant="body2">
      You do not have a submission email configured. Please add one in your{" "}
      <Link
        href={`/app/${teamSlug}/settings/integrations`}
        target="_blank"
        rel="noopener noreferrer"
      >
        team settings
      </Link>
      .
    </Typography>
  </ErrorWrapper>
);

const EmailSelection: React.FC<EmailSelectionProps> = ({
  teamSlug,
  emailOptions,
  newEmail,
  submissionEmailId,
  isNewEmailSelected,
  handleSelectChange,
  disabled,
  newEmailError,
  setFieldValue,
}) => (
  <>
    <InputRow>
      <Typography variant="body2" mb={2}>
        Select a submission email for this service. To add or update submission
        emails, please visit your{" "}
        <Link
          href={`/app/${teamSlug}/settings/integrations`}
          target="_blank"
          rel="noopener noreferrer"
        >
          team settings
        </Link>{" "}
        page.
      </Typography>
    </InputRow>
    <InputRow>
      <SelectInput
        name="submissionEmail"
        value={isNewEmailSelected ? "new-email" : submissionEmailId}
        onChange={handleSelectChange}
        bordered
        disabled={disabled}
      >
        {emailOptions.map((email) => (
          <MenuItem key={email.id} value={email.id}>
            {email.submissionEmail}
          </MenuItem>
        ))}
        <MenuItem value="new-email">New email...</MenuItem>
      </SelectInput>
    </InputRow>
    {isNewEmailSelected && (
      <Input
        name="newEmail"
        value={newEmail}
        placeholder="Enter new email"
        onChange={(e) => {
            setFieldValue("newEmail", e.target.value);
          }}
        disabled={disabled}
        errorMessage={newEmailError}
      />
    )}
  </>
);

export type Props = EditorProps<TYPES.Send, Send>;

const SendComponent: React.FC<Props> = (props) => {
  const formik = useFormikWithRef<Send>(
    {
      initialValues: parseSend(props.node?.data),
      onSubmit: async (newValues) => {
        try {
          if (props.handleSubmit) {
            const updatedEmailId = await handleInsertOrUpdate(
              newValues,
              existingEmailId,
              insertNewDefaultEmail,
            );

            if (updatedEmailId) {
              newValues.submissionEmailId = updatedEmailId;
            }

            props.handleSubmit({ type: TYPES.Send, data: newValues });
          }
        } catch (error) {
          formik.setFieldError("submissionEmailId", (error as Error).message);
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

  const [teamSlug, teamId, flowSlug, id] = useStore((state) => [
    state.teamSlug,
    state.teamId,
    state.flowSlug,
    state.id,
  ]);

  const {
    data: flowData,
    loading: flowLoading,
    error: flowError,
    refetch: refetchFlowData,
  } = useFlowEmailId(id);
  const existingEmailId = flowData?.flowsByPK?.submissionEmailId;

  const { data, loading, error } = useTeamSubmissionIntegrations(teamId);
  const emailOptions = data?.submissionIntegrations || [];
  const defaultEmail = emailOptions.find(
    (email) => email.defaultEmail === true,
  );
  const insertNewDefaultEmail = defaultEmail ? false : true; // if an existing defaultEmail is set, the newly added one is not default

  const [insertSubmissionIntegration] = useInsertSubmissionIntegration();
  const [updateFlowSubmissionEmail] = useUpdateFlowSubmissionEmail();

  const handleInsertOrUpdate = async (
    newValues: Send,
    existingEmailId: string | undefined,
    insertNewDefaultEmail: boolean,
  ): Promise<string | undefined> => {
    const selectedEmailId = newValues.submissionEmailId;
    const newEmail = newValues.newEmail;

    if (selectedEmailId === "new-email" && newEmail) {
      const { data } = await insertSubmissionIntegration({
        variables: {
          submissionEmail: newEmail,
          defaultEmail: insertNewDefaultEmail,
          teamId,
        },
      });
      const submissionEmailId = data?.insertSubmissionIntegrationsOne?.id;
      if (!submissionEmailId) {
        throw new Error("No submission email ID was returned");
      }
      await updateFlowSubmissionEmail({
        variables: {
          flowId: id,
          submissionEmailId,
        },
      });
      return submissionEmailId;
    }

    if (selectedEmailId && existingEmailId !== selectedEmailId) {
      await updateFlowSubmissionEmail({
        variables: {
          flowId: id,
          submissionEmailId: selectedEmailId,
        },
      });
      return selectedEmailId;
    }
  };

  const isNewEmailSelected = formik.values.submissionEmailId === "new-email";

  useEffect(() => {
    if (flowData) {
      const existingEmailId = flowData.flowsByPK?.submissionEmailId;
      if (!formik.values.submissionEmailId && existingEmailId) {
        formik.setFieldValue("submissionEmailId", existingEmailId);
      } else if (!formik.values.submissionEmailId && defaultEmail?.id) {
        formik.setFieldValue("submissionEmailId", defaultEmail.id);
      }
    }
  }, [flowData, defaultEmail?.id, formik.values.submissionEmailId]);

  const handleSelectChange = (event: SelectChangeEvent<unknown>) => {
    const selectedValue = event.target.value as string;
    formik.setFieldValue("submissionEmailId", selectedValue);
  };

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

  const renderEmailContent = () => {
    if (loading || flowLoading) {
      return <EmailLoadingState />;
    } else if (error || flowError) {
      return <EmailErrorState />;
    } else if (emailOptions.length === 0) {
      return (
        <EmailEmptyState
          teamSlug={teamSlug}
          error={getIn(formik.errors, "submissionEmailId")}
        />
      );
    } else
      return (
        <EmailSelection
          teamSlug={teamSlug}
          emailOptions={emailOptions}
          currentEmail={currentEmail}
          newEmail={formik.values.newEmail}
          submissionEmailId={formik.values.submissionEmailId}
          isNewEmailSelected={isNewEmailSelected}
          handleSelectChange={handleSelectChange}
          disabled={props.disabled}
          newEmailError={formik.errors.newEmail}
          setFieldValue={formik.setFieldValue}
        />
      );
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
                  label={`Send to email`}
                  disabled={props.disabled}
                />
              </InputRow>
              <>
                {formik.values.destinations.includes("email") &&
                  renderEmailContent()}
              </>
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
