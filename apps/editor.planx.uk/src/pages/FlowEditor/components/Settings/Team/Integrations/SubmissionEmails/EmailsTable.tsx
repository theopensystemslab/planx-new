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
import {
  GET_TEAM_SUBMISSION_INTEGRATIONS,
} from "./queries";
import { GetSubmissionEmails, SubmissionEmailInput } from "./types";

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

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  border: `1px solid ${theme.palette.border.light}`,
  borderRadius: theme.shape.borderRadius,
  overflow: "hidden",
}));

const EmailsTableContent = () => {
  const teamId = useStore((state) => state.teamId);

  const { data, loading, refetch } = useQuery<GetSubmissionEmails>(
    GET_TEAM_SUBMISSION_INTEGRATIONS,
    {
      variables: { teamId },
    },
  );

  const emails = data?.submissionIntegrations;

  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState<"add" | "edit" >(
    "add",
  );
  const [initialValues, setInitialValues] = useState<
    SubmissionEmailInput | undefined
  >();

  const currentDefault = emails?.find(
    (email: SubmissionEmailInput) => email.defaultEmail === true,
  );

  const addEmail = () => {
    setActionType("add");
    setShowModal(true);

    if (!emails || emails.length === 0) {
      setInitialValues({ defaultEmail: true } as SubmissionEmailInput);
    } else {
      setInitialValues(undefined);
    }
  };

  const handleEditEmail = (email: SubmissionEmailInput) => {
    setActionType("edit");
    setInitialValues(email);
    setShowModal(true);
  };

  if (loading) return <div>Loading...</div>;

  if (!emails || emails.length === 0) {
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
        {showModal && (
          <EmailsUpsertModal
            showModal={showModal}
            setShowModal={setShowModal}
            initialValues={initialValues}
            actionType={actionType}
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
            </StyledTableRow>
          </TableHead>
          <TableBody>
            {emails.map((email: SubmissionEmailInput) => (
              <StyledTableRow key={email.id}>
                <TableCell sx={{ wordWrap: "break-word", maxWidth: "280px" }}>
                  {email.submissionEmail}
                </TableCell>
                <TableCell align="center">
                  {email.defaultEmail && <CheckIcon color="primary" />}
                </TableCell>
                <TableCell>
                  <EditEmailButton onClick={() => handleEditEmail(email)}>
                    Edit
                  </EditEmailButton>
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
      </StyledTableContainer>
      {showModal && (
        <EmailsUpsertModal
          showModal={showModal}
          setShowModal={setShowModal}
          initialValues={initialValues}
          actionType={actionType}
          currentEmails={data.submissionIntegrations.map(
            (email) => email.submissionEmail,
          )}
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
