import Link from "@mui/material/Link";
import MenuItem from "@mui/material/MenuItem";
import { SelectChangeEvent } from "@mui/material/Select";
import Typography from "@mui/material/Typography";
import { SendIntegration } from "@opensystemslab/planx-core/types";
import { Send } from "@planx/components/Send/model";
import { getIn } from "formik";
import { useFormikContext } from "formik";
import { useEffect } from "react";
import React from "react";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import ErrorWrapper from "ui/shared/ErrorWrapper";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";
import SelectInput from "ui/shared/SelectInput/SelectInput";
import { Switch } from "ui/shared/Switch";

import { useFlowEmailId } from "./hooks/useFlowEmailId";
import { useTeamSubmissionIntegrations } from "./hooks/useGetTeamSubmissionIntegrations";
import { EmailEmptyStateProps, EmailSelectionProps } from "./types";

interface EmailSectionProps {
  id: string;
  teamId: number;
  teamSlug: string;
  toggleSwitch: (value: SendIntegration) => void;
  disabled?: boolean;
}

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

const EmailSection: React.FC<EmailSectionProps> = ({
  id,
  teamId,
  teamSlug,
  toggleSwitch,
  disabled,
}) => {
  const { values, setFieldValue, errors } = useFormikContext<Send>();

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

  const isNewEmailSelected = values.submissionEmailId === "new-email";

  useEffect(() => {
    if (flowData) {
      const existingEmailId = flowData.flowsByPK?.submissionEmailId;
      if (!values.submissionEmailId && existingEmailId) {
        setFieldValue("submissionEmailId", existingEmailId);
      } else if (!values.submissionEmailId && defaultEmail?.id) {
        setFieldValue("submissionEmailId", defaultEmail.id);
      }
    }
  }, [flowData, defaultEmail?.id, values.submissionEmailId]);

  const handleSelectChange = (event: SelectChangeEvent<unknown>) => {
    const selectedValue = event.target.value as string;
    setFieldValue("submissionEmailId", selectedValue);
  };

  const currentEmail = emailOptions.find(
    (email) => email.id === existingEmailId,
  );

  const renderEmailContent = () => {
    if (loading || flowLoading) {
      return <EmailLoadingState />;
    } else if (error || flowError) {
      return <EmailErrorState />;
    } else if (emailOptions.length === 0) {
      return (
        <EmailEmptyState
          teamSlug={teamSlug}
          error={getIn(errors, "submissionEmailId")}
        />
      );
    } else
      return (
        <EmailSelection
          teamSlug={teamSlug}
          emailOptions={emailOptions}
          currentEmail={currentEmail}
          newEmail={values.newEmail}
          submissionEmailId={values.submissionEmailId}
          isNewEmailSelected={isNewEmailSelected}
          handleSelectChange={handleSelectChange}
          disabled={disabled}
          newEmailError={errors.newEmail}
          setFieldValue={setFieldValue}
        />
      );
  };

  return (
    <ModalSectionContent title={"Email"}>
      <InputRow>
        <Switch
          checked={values.destinations.includes("email")}
          onChange={() => toggleSwitch("email")}
          label={`Send to email`}
          disabled={disabled}
        />
      </InputRow>
      <>{values.destinations.includes("email") && renderEmailContent()}</>
    </ModalSectionContent>
  );
};

export default EmailSection;
