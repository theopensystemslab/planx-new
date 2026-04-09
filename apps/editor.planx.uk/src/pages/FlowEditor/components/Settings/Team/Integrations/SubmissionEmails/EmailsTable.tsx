import { useQuery } from "@apollo/client";
import CheckIcon from "@mui/icons-material/Check";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import ErrorFallback from "components/Error/ErrorFallback";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { AddButton } from "ui/editor/AddButton";

import { StyledTableRow } from "../../../../Team/styles";
import { EmailsUpsertModal } from "./EmailsUpsertModal";
import { GET_TEAM_SUBMISSION_EMAILS } from "./queries";
import { RemoveEmailModal } from "./RemoveEmailModal";
import {
  GetSubmissionEmails,
  ModalState,
  SubmissionEmailInput,
  SubmissionEmailWithFlows,
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

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  border: `1px solid ${theme.palette.border.light}`,
  borderRadius: theme.shape.borderRadius,
  overflow: "hidden",
}));

const EmailsTableContent = () => {
  const teamId = useStore((state) => state.teamId);

  const { data, loading, refetch } = useQuery<GetSubmissionEmails>(
    GET_TEAM_SUBMISSION_EMAILS,
    {
      variables: { teamId },
    },
  );

  const submissionEmails = data?.submissionEmails;

  const [modalState, setModalState] = useState<ModalState>(null);

  const addEmail = () => {
    setModalState({
      type: "upsert",
      actionType: "add",
    });
  };

  const handleEditEmail = (email: SubmissionEmailInput) => {
    setModalState({
      type: "upsert",
      actionType: "edit",
      email: email,
    });
  };

  const deleteEmail = (email: SubmissionEmailWithFlows) => {
    setModalState({
      type: "delete",
      email: email,
    });
  };

  if (loading) return <div>Loading...</div>;

  if (!submissionEmails || submissionEmails.length === 0) {
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
                <AddButton onClick={addEmail}>Add a new email</AddButton>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        {modalState && modalState?.type === "upsert" && (
          <EmailsUpsertModal
            modalState={modalState}
            setModalState={setModalState}
            refetch={refetch}
          />
        )}
      </>
    );
  }

  return (
    <>
      <StyledTableContainer>
        <Table>
          <TableHead>
            <StyledTableRow>
              <TableCell>Email</TableCell>
              <TableCell align="center">Default</TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
            </StyledTableRow>
          </TableHead>
          <TableBody>
            {submissionEmails.map(
              (submissionEmail: SubmissionEmailWithFlows) => (
                <StyledTableRow key={submissionEmail.id}>
                  <TableCell sx={{ wordWrap: "break-word", maxWidth: "280px" }}>
                    {submissionEmail.address}
                  </TableCell>
                  <TableCell align="center">
                    {submissionEmail.isDefault && (
                      <CheckIcon color="primary" />
                    )}
                  </TableCell>
                  <TableCell>
                    <EditEmailButton
                      onClick={() => handleEditEmail(submissionEmail)}
                    >
                      Edit
                    </EditEmailButton>
                  </TableCell>
                  <TableCell>
                    {!submissionEmail.isDefault && (
                      <RemoveEmailButton
                        onClick={() => deleteEmail(submissionEmail)}
                      >
                        Remove
                      </RemoveEmailButton>
                    )}
                  </TableCell>
                </StyledTableRow>
              ),
            )}
            <TableRow>
              <TableCell colSpan={4}>
                <AddButton onClick={addEmail}>Add a new email</AddButton>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </StyledTableContainer>
      {modalState && modalState.type === "upsert" && (
        <EmailsUpsertModal
          modalState={modalState}
          setModalState={setModalState}
          refetch={refetch}
          currentEmails={submissionEmails.map(
            (email) => email.address,
          )}
        />
      )}
      {modalState && modalState.type === "delete" && (
        <RemoveEmailModal
          modalState={modalState}
          setModalState={setModalState}
          refetch={refetch}
        />
      )}
    </>
  );
};

export const EmailsTable = () => (
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <EmailsTableContent />
  </ErrorBoundary>
);
