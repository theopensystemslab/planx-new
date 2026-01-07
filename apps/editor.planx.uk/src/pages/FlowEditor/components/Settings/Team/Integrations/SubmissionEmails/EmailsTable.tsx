import { useMutation, useQuery } from "@apollo/client";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { Role } from "@opensystemslab/planx-core/types";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useState } from "react";
import { AddButton } from "ui/editor/AddButton";
import Permission from "ui/editor/Permission";

import { RemoveUserModal } from "../../../../Team/components/RemoveUserModal";
import { UserUpsertModal } from "../../../../Team/components/UserUpsertModal";
import { StyledAvatar, StyledTableRow } from "../../../../Team/styles";
import {
  ActionType,
  MembersTableProps,
  TeamMember,
} from "../../../../Team/types";
import SubmissionEmails from ".";
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
  SubmissionEmailValues,
  UpdateTeamSubmissionIntegrationsVariables,
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

  // Track the current default email from the database
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
    setInitialValues(undefined);
  };

  const handleAddEmail = () => {
    setActionType("add");
    setInitialValues(undefined);
    setShowModal(true);
  };

  const handleEditEmail = (email: SubmissionEmailInput) => {
    setActionType("edit");
    setInitialValues(email);
    setShowModal(true);
  };

  // Update the selected default email when data loads
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
                  <Radio
                    checked={selectedDefault === email.id}
                    onChange={() => handleDefaultChange(email.id!)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <EditEmailButton onClick={() => handleEditEmail(email)}>
                    Edit
                  </EditEmailButton>
                </TableCell>
                <TableCell>
                  {currentDefault !== email.id && (
                    <RemoveEmailButton onClick={() => handleRemoveEmail(email)}>
                      Remove
                    </RemoveEmailButton>
                  )}
                </TableCell>
              </StyledTableRow>
            ))}
            <TableRow>
              <TableCell colSpan={4}>
                <AddButton onClick={handleAddEmail}>Add a new email</AddButton>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      <Box mt={2}>
        <Button
          variant="contained"
          onClick={handleUpdateDefault}
          disabled={selectedDefault === currentDefault}
        >
          Update default email
        </Button>
      </Box>
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
