import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { Role } from "@opensystemslab/planx-core/types";
import React, { useState } from "react";
import { AddButton } from "ui/editor/AddButton";

import { StyledAvatar, StyledTableRow } from "../styles";
import {
  MembersTableProps,
  type ModalState,
  ROLE_LABELS,
  TeamMember,
} from "../types";
import { AddUserModal } from "./AddUserModal";
import { EditUserModal } from "./EditUserModal";
import { RemoveUserModal } from "./RemoveUserModal";

const TableRowButton = styled(Button)(({ theme }) => ({
  textDecoration: "underline",
  boxShadow: "none",
  "&:hover": {
    boxShadow: "none",
    textDecoration: "underline",
    backgroundColor: theme.palette.action.hover,
  },
}));

const EditUserButton = styled(TableRowButton)(({ theme }) => ({
  color: theme.palette.primary.light,
  "&:hover": {
    color: theme.palette.primary.dark,
  },
}));

const RemoveUserButton = styled(TableRowButton)(({ theme }) => ({
  color: theme.palette.text.secondary,
  "&:hover": {
    color: theme.palette.secondary.contrastText,
  },
}));

const getRoleLabel = (role: Role) => ROLE_LABELS[role] ?? role;

export const MembersTable = ({
  members,
  showAddMemberButton,
  showEditMemberButton,
  showRemoveMemberButton,
}: MembersTableProps) => {
  const [modal, setModal] = useState<ModalState>({ action: "closed" });

  const closeModal = () => setModal({ action: "closed" });
  const addUser = () => setModal({ action: "add" });
  const editUser = (member: TeamMember) => setModal({ action: "edit", member });
  const removeUser = (member: TeamMember) =>
    setModal({ action: "remove", member });

  if (members.length === 0) {
    return (
      <>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>No members found</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          {showAddMemberButton && (
            <TableBody>
              <TableRow>
                <TableCell colSpan={3}>
                  <AddButton onClick={addUser}>Add a new member</AddButton>
                </TableCell>
              </TableRow>
            </TableBody>
          )}
        </Table>
        {modal.action !== "closed" && (
          <AddUserModal onClose={closeModal} action="add" />
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
              <TableCell sx={{ width: 300 }}>
                <strong>User</strong>
              </TableCell>
              <TableCell sx={{ width: 200 }}>
                <strong>Role</strong>
              </TableCell>
              <TableCell>
                <strong>Email</strong>
              </TableCell>
              {
                // empty table cells for styling across buttons
              }
              <TableCell></TableCell>
              <TableCell></TableCell>
            </StyledTableRow>
          </TableHead>
          <TableBody
            data-testid={`members-table${showAddMemberButton && "-add-member"}`}
          >
            {members.map((member) => (
              <StyledTableRow key={member.id} data-testid="member-row">
                <TableCell
                  sx={{
                    display: "table-cell",
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <StyledAvatar>
                      {member.firstName[0]}
                      {member.lastName[0]}
                    </StyledAvatar>
                    {member.firstName} {member.lastName}
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={getRoleLabel(member.role)}
                    size="small"
                    sx={{ background: "#ddd" }}
                  />
                </TableCell>
                <TableCell>{member.email}</TableCell>
                <TableCell>
                  {showEditMemberButton && (
                    <EditUserButton
                      onClick={() => editUser(member)}
                      data-testid={`edit-button-${member.id}`}
                    >
                      Edit
                    </EditUserButton>
                  )}
                </TableCell>
                <TableCell>
                  {showRemoveMemberButton && (
                    <RemoveUserButton
                      onClick={() => removeUser(member)}
                      data-testid={`remove-button-${member.id}`}
                    >
                      Remove
                    </RemoveUserButton>
                  )}
                </TableCell>
              </StyledTableRow>
            ))}
            {showAddMemberButton && (
              <TableRow>
                <TableCell colSpan={5}>
                  <AddButton onClick={addUser}>Add a new member</AddButton>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {modal.action === "remove" && (
        <RemoveUserModal
          onClose={closeModal}
          member={modal.member}
          action="remove"
        />
      )}

      {modal.action === "add" && (
        <AddUserModal
          onClose={closeModal}
          action={modal.action}
        />
      )}

      {modal.action === "edit" && (
        <EditUserModal
          onClose={closeModal}
          member={modal.member}
          action={modal.action}
        />
      )}
    </>
  );
};
