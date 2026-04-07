import { ApolloError } from "@apollo/client";
import Link from "@mui/material/Link";
import MenuItem from "@mui/material/MenuItem";
import { SelectChangeEvent } from "@mui/material/Select";
import Typography from "@mui/material/Typography";
import { SendIntegration } from "@opensystemslab/planx-core/types";
import { Send } from "@planx/components/Send/model";
import { useFormikContext } from "formik";
import { SubmissionEmailInput } from "pages/FlowEditor/components/Settings/Team/Integrations/SubmissionEmails/types";
import React, { useEffect } from "react";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";
import SelectInput from "ui/shared/SelectInput/SelectInput";
import { Switch } from "ui/shared/Switch";

import { useTeamSubmissionIntegrations } from "./hooks/useGetTeamSubmissionIntegrations";
import { EmailSelectionProps } from "./types";

interface EmailSectionProps {
  teamId: number;
  teamSlug: string;
  toggleSwitch: (value: SendIntegration) => void;
  disabled?: boolean;
}

interface EmailContentProps {
  loading: boolean;
  error: ApolloError | undefined;
  teamSlug: string;
  emailOptions: Required<SubmissionEmailInput>[];
  submissionEmailId: string | undefined;
  handleSelectChange: (event: SelectChangeEvent<unknown>) => void;
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

const EmailSelection: React.FC<EmailSelectionProps> = ({
  teamSlug,
  emailOptions,
  submissionEmailId,
  handleSelectChange,
  disabled,
}) => {
  const { values, setFieldValue, touched, errors } = useFormikContext<Send>();

  const newEmail = values.newEmail;
  const isNewEmailSelected =
    emailOptions.length === 0 ? true : values.submissionEmailId === "new-email";
  const newEmailError = errors.newEmail;

  useEffect(() => {
    if (emailOptions.length === 0 && values.submissionEmailId !== "new-email") {
      setFieldValue("submissionEmailId", "new-email");
    }
  }, [emailOptions.length, setFieldValue, values.submissionEmailId]);

  return (
    <>
      <InputRow>
        <Typography variant="body2" mb={2}>
          Add or select a submission email address for this service. To edit or
          delete submission emails, please visit your{" "}
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
      {emailOptions.length > 0 && (
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
      )}
      {isNewEmailSelected && (
        <Input
          name="newEmail"
          value={newEmail}
          placeholder="Enter new email"
          onChange={(e) => {
            setFieldValue("newEmail", e.target.value);
          }}
          disabled={disabled}
          errorMessage={touched.newEmail ? newEmailError : undefined}
        />
      )}
    </>
  );
};

const EmailSection: React.FC<EmailSectionProps> = ({
  teamId,
  teamSlug,
  toggleSwitch,
  disabled,
}) => {
  const { values, setFieldValue } = useFormikContext<Send>();

  const { data, loading, error } = useTeamSubmissionIntegrations(teamId);
  const emailOptions = data?.submissionIntegrations || [];
  const defaultEmail = emailOptions.find(
    (email) => email.defaultEmail === true,
  );

  const handleSelectChange = (event: SelectChangeEvent<unknown>) => {
    const selectedValue = event.target.value as string;
    setFieldValue("submissionEmailId", selectedValue);
  };

  useEffect(() => {
    if (!values.submissionEmailId && defaultEmail) {
      setFieldValue("submissionEmailId", defaultEmail.id);
    }
  }, [defaultEmail?.id, defaultEmail, setFieldValue, values.submissionEmailId]);

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
      <EmailContent
        loading={loading}
        error={error}
        teamSlug={teamSlug}
        emailOptions={emailOptions}
        submissionEmailId={values.submissionEmailId}
        handleSelectChange={handleSelectChange}
      />
    </ModalSectionContent>
  );
};

const EmailContent: React.FC<EmailContentProps> = ({
  loading,
  error,
  teamSlug,
  emailOptions,
  submissionEmailId,
  handleSelectChange,
}) => {
  if (loading) return <EmailLoadingState />;
  if (error) return <EmailErrorState />;

  return (
    <EmailSelection
      teamSlug={teamSlug}
      emailOptions={emailOptions}
      submissionEmailId={submissionEmailId}
      handleSelectChange={handleSelectChange}
    />
  );
};

export default EmailSection;
