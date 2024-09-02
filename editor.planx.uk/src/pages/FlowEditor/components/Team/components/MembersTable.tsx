import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import Snackbar from "@mui/material/Snackbar";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { AddButton } from "pages/Team";
import React, { useState } from "react";

import { StyledAvatar, StyledTableRow } from "./../styles";
import { MembersTableProps } from "./../types";
import { AddNewEditorModal } from "./AddNewEditorModal";

export const MembersTable = ({
  members,
  showAddMemberButton,
}: MembersTableProps) => {
  const [showModal, setShowModal] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);

  const handleCloseSuccessToast = (
    _event?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setShowSuccessToast(false);
  };

  const handleCloseErrorToast = (
    _event?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setShowErrorToast(false);
  };

  const roleLabels: Record<string, string> = {
    platformAdmin: "Admin",
    teamEditor: "Editor",
    teamViewer: "Viewer",
  };

  const getRoleLabel = (role: string) => {
    return roleLabels[role] || role;
  };

  if (members.length === 0) {
    return (
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              <strong>No members found</strong>
            </TableCell>
          </TableRow>
        </TableHead>
      </Table>
    );
  }

  return (
    <>
      <TableContainer>
        <Table>
          <TableHead>
            <StyledTableRow>
              <TableCell sx={{ width: 300 }}>
                <strong>User</strong>
              </TableCell>
              <TableCell sx={{ width: 200 }}>
                <strong>Role</strong>
              </TableCell>
              <TableCell>
                <strong>Email</strong>
              </TableCell>
            </StyledTableRow>
          </TableHead>
          <TableBody
            data-testid={`members-table${showAddMemberButton && "-add-editor"}`}
          >
            {members.map((member) => (
              <StyledTableRow key={member.id}>
                <TableCell
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <StyledAvatar>
                    {member.firstName[0]}
                    {member.lastName[0]}
                  </StyledAvatar>
                  {member.firstName} {member.lastName}
                </TableCell>
                <TableCell>
                  <Chip
                    label={getRoleLabel(member.role)}
                    size="small"
                    sx={{ background: "#ddd" }}
                  />
                </TableCell>
                <TableCell>{member.email}</TableCell>
              </StyledTableRow>
            ))}
            {showAddMemberButton && (
              <TableRow>
                <TableCell colSpan={3}>
                  <AddButton onClick={() => setShowModal(true)}>
                    Add a new editor
                  </AddButton>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {showAddMemberButton && (
          <Snackbar
            open={showSuccessToast}
            autoHideDuration={6000}
            onClose={handleCloseSuccessToast}
          >
            <Alert
              onClose={handleCloseSuccessToast}
              severity="success"
              sx={{ width: "100%" }}
            >
              Successfully added a user
            </Alert>
          </Snackbar>
        )}
        {showAddMemberButton && (
          <Snackbar
            open={showErrorToast}
            autoHideDuration={6000}
            onClose={handleCloseErrorToast}
          >
            <Alert
              onClose={handleCloseErrorToast}
              severity="error"
              sx={{ width: "100%" }}
            >
              Failed to add new user, please try again
            </Alert>
          </Snackbar>
        )}
      </TableContainer>
      {showModal && (
        <AddNewEditorModal
          setShowSuccessToast={setShowSuccessToast}
          setShowErrorToast={setShowErrorToast}
          showModal={showModal}
          setShowModal={setShowModal}
        />
      )}
    </>
  );
};
