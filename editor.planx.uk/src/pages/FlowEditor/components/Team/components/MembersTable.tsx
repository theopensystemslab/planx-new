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
import Permission from "ui/editor/Permission";

import { StyledAvatar, StyledTableRow } from "./../styles";
import { ActionType, MembersTableProps, TeamMember } from "./../types";
import { RemoveUserModal } from "./RemoveUserModal";
import { UserUpsertModal } from "./UserUpsertModal";

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

export const MembersTable = ({
  members,
  showAddMemberButton,
  showEditMemberButton,
  showRemoveMemberButton,
}: MembersTableProps) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [actionType, setActionType] = useState<ActionType>("add");
  const [initialValues, setInitialValues] = useState<TeamMember | undefined>();

  const roleLabels: Record<Role, string> = {
    platformAdmin: "Admin",
    teamEditor: "Editor",
    teamViewer: "Viewer",
    demoUser: "Demo User",
    public: "Public",
    analyst: "Analyst",
  };

  const editUser = (member: TeamMember) => {
    setActionType("edit");
    setShowModal(true);
    setInitialValues(member);
  };

  const removeUser = (member: TeamMember) => {
    setActionType("remove");
    setShowModal(true);
    setInitialValues(member);
  };

  const addUser = () => {
    setActionType("add");
    setShowModal(true);
    setInitialValues(undefined);
  };

  const getRoleLabel = (role: Role) => {
    return roleLabels[role] || role;
  };

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
            <Permission.IsPlatformAdmin>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={3}>
                    <AddButton
                      onClick={() => {
                        addUser();
                      }}
                    >
                      Add a new member
                    </AddButton>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Permission.IsPlatformAdmin>
          )}
        </Table>
        {showModal && (
          <UserUpsertModal
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
              <StyledTableRow key={member.id}>
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
                  <Permission.IsPlatformAdmin>
                    {showEditMemberButton && (
                      <EditUserButton
                        onClick={() => {
                          editUser(member);
                        }}
                        data-testid={`edit-button-${member.id}`}
                      >
                        Edit
                      </EditUserButton>
                    )}
                  </Permission.IsPlatformAdmin>
                </TableCell>
                <TableCell>
                  <Permission.IsPlatformAdmin>
                    {showRemoveMemberButton && (
                      <RemoveUserButton
                        onClick={() => {
                          removeUser(member);
                        }}
                        data-testid={`remove-button-${member.id}`}
                      >
                        Remove
                      </RemoveUserButton>
                    )}
                  </Permission.IsPlatformAdmin>
                </TableCell>
              </StyledTableRow>
            ))}
            {showAddMemberButton && (
              <Permission.IsPlatformAdmin>
                <TableRow>
                  <TableCell colSpan={5}>
                    <AddButton
                      onClick={() => {
                        addUser();
                      }}
                    >
                      Add a new member
                    </AddButton>
                  </TableCell>
                </TableRow>
              </Permission.IsPlatformAdmin>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {showModal &&
        (actionType === "remove" ? (
          <RemoveUserModal
            setShowModal={setShowModal}
            showModal={showModal}
            initialValues={initialValues}
            actionType={actionType}
          />
        ) : (
          <UserUpsertModal
            setShowModal={setShowModal}
            showModal={showModal}
            initialValues={initialValues}
            actionType={actionType}
          />
        ))}
    </>
  );
};
