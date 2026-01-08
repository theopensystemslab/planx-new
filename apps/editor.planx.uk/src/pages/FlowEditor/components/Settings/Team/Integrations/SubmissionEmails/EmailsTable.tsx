import { useMutation, useQuery } from "@apollo/client";
import CheckIcon from "@mui/icons-material/Check";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Radio from "@mui/material/Radio";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useState } from "react";
import { AddButton } from "ui/editor/AddButton";

import { StyledTableRow } from "../../../../Team/styles";
import { EmailsUpsertModal } from "./EmailsUpsertModal";
import {
  DELETE_TEAM_SUBMISSION_INTEGRATIONS,
  GET_TEAM_SUBMISSION_INTEGRATIONS,
  UPSERT_TEAM_SUBMISSION_INTEGRATIONS,
} from "./queries";
import {
  GetSubmissionEmails,
  SubmissionEmailInput,
  SubmissionEmailMutation,
} from "./types";

const TableRowButton = styled(Button)(({ theme }) => ({
  textDecoration: "underline",
  boxShadow: "none",
  "&:hover": {
    boxShadow: "none",
    textDecoration: "underline",
    backgroundColor: theme.palette.action.hover,
  },
}));

const EditEmailButton = styled(TableRowButton)(({ theme }) => ({
  color: theme.palette.primary.light,
  "&:hover": {
    color: theme.palette.primary.dark,
  },
}));

const RemoveEmailButton = styled(TableRowButton)(({ theme }) => ({
  color: theme.palette.text.secondary,
  "&:hover": {
    color: theme.palette.secondary.contrastText,
  },
}));

export const EmailsTable = () => {
  const teamId = useStore((state) => state.teamId);

  const { data, loading, error } = useQuery(GET_TEAM_SUBMISSION_INTEGRATIONS, {
    variables: { teamId },
  });

  const [upsertEmail] = useMutation(UPSERT_TEAM_SUBMISSION_INTEGRATIONS);
  const [deleteEmail] = useMutation(DELETE_TEAM_SUBMISSION_INTEGRATIONS);
  const [selectedDefault, setSelectedDefault] = useState<string | null>(null);

  const currentDefault = data?.submissionIntegrations.find(
    (email: SubmissionEmailInput) => email.defaultEmail,
  )?.id;

  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState<"add" | "edit" | "remove">(
    "add",
  );
  const [initialValues, setInitialValues] = useState<
    SubmissionEmailInput | undefined
  >();

  const addEmail = () => {
    setActionType("add");
    setShowModal(true);

    // We want defaultEmail to be true for the very first email
    if (!data || data.submissionIntegrations.length === 0) {
      setInitialValues({ defaultEmail: true } as SubmissionEmailInput);
    } else {
      setInitialValues(undefined);
    }
  };

  const handleAddEmail = () => {
    setActionType("add");
    if (!data || data.submissionIntegrations.length === 0) {
      setInitialValues({ defaultEmail: true } as SubmissionEmailInput);
    } else {
      setInitialValues(undefined);
    }
    setShowModal(true);
  };

  const handleEditEmail = (email: SubmissionEmailInput) => {
    setActionType("edit");
    setInitialValues(email);
    setShowModal(true);
  };

  React.useEffect(() => {
    if (currentDefault) {
      setSelectedDefault(currentDefault);
    }
  }, [currentDefault]);

  const handleDefaultChange = (emailId: string) => {
    setSelectedDefault(emailId);
  };

  const handleUpdateDefault = async () => {
    if (!selectedDefault) return;

    const updatedEmails: SubmissionEmailMutation[] =
      data.submissionIntegrations.map((email: SubmissionEmailInput) => ({
        id: email.id,
        submission_email: email.submissionEmail,
        default_email: email.id === selectedDefault,
        team_id: email.teamId,
      }));

    await upsertEmail({
      variables: { emails: updatedEmails },
      optimisticResponse: {
        upsert_submission_integrations: {
          returning: updatedEmails,
        },
      },
    });
  };

  const handleRemoveEmail = async (email: SubmissionEmailInput) => {
    await deleteEmail({
      variables: { submissionEmail: email.submissionEmail, teamId },
      optimisticResponse: {
        delete_submission_integrations: {
          returning: [{ ...email }],
        },
      },
      update: (cache) => {
        const existingData = cache.readQuery<GetSubmissionEmails>({
          query: GET_TEAM_SUBMISSION_INTEGRATIONS,
          variables: { teamId },
        });

        if (!existingData) {
          return;
        }
        const updatedEmails = existingData.submissionIntegrations.filter(
          (e: SubmissionEmailInput) => e.id !== email.id,
        );
        cache.writeQuery({
          query: GET_TEAM_SUBMISSION_INTEGRATIONS,
          variables: { teamId },
          data: { submissionIntegrations: updatedEmails },
        });
      },
    });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading emails</div>;

  if (data.submissionIntegrations.length === 0) {
    return (
      <>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>No emails found</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell colSpan={3}>
                <AddButton
                  onClick={() => {
                    addEmail();
                  }}
                >
                  Add a new email
                </AddButton>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        {showModal && (
          <EmailsUpsertModal
            showModal={showModal}
            setShowModal={setShowModal}
            initialValues={initialValues}
            actionType={actionType}
            upsertEmail={upsertEmail}
          />
        )}
      </>
    );
  }

  return (
    <>
      <TableContainer>
        <Table>
          <TableHead>
            <StyledTableRow>
              <TableCell>Email</TableCell>
              <TableCell>Default</TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
            </StyledTableRow>
          </TableHead>
          <TableBody>
            {data.submissionIntegrations.map((email: SubmissionEmailInput) => (
              <StyledTableRow key={email.id}>
                <TableCell>{email.submissionEmail}</TableCell>
                <TableCell>
                  {email.defaultEmail && <CheckIcon color="primary" />}
                </TableCell>
                <TableCell>
                  <EditEmailButton onClick={() => handleEditEmail(email)}>
                    Edit
                  </EditEmailButton>
                </TableCell>
                <TableCell>
                  {!email.defaultEmail && (
                    <RemoveEmailButton onClick={() => handleRemoveEmail(email)}>
                      Remove
                    </RemoveEmailButton>
                  )}
                </TableCell>
              </StyledTableRow>
            ))}
            <TableRow>
              <TableCell colSpan={4}>
                <AddButton onClick={addEmail}>Add a new email</AddButton>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      {showModal && (
        <EmailsUpsertModal
          showModal={showModal}
          setShowModal={setShowModal}
          initialValues={initialValues}
          actionType={actionType}
          upsertEmail={upsertEmail}
        />
      )}
    </>
  );
};
