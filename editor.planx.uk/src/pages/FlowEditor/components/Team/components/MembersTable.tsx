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
import { AddButton } from "pages/Team";
import React, { useState } from "react";
import Permission from "ui/editor/Permission";

import { StyledAvatar, StyledTableRow } from "./../styles";
import { MembersTableProps, TeamMember } from "./../types";
import { EditorUpsertModal } from "./EditorUpsertModal";

const TableRowButton = styled(Button)(() => ({
  textDecoration: "underline",
  boxShadow: "none",
  "&:hover": {
    boxShadow: "none",
    textDecoration: "underline",
    backgroundColor: "transparent",
  },
}));
const EditUserButton = styled(TableRowButton)(({ theme }) => ({
  color: theme.palette.primary.light,
  textDecoration: "underline",
  boxShadow: "none",
  "&:hover": {
    boxShadow: "none",
    color: theme.palette.primary.dark,
    textDecoration: "underline",
  },
}));
const RemoveUserButton = styled(TableRowButton)(({ theme }) => ({
  color: theme.palette.secondary.dark,
  "&:hover": {
    color: theme.palette.secondary.contrastText,
  },
}));

export const MembersTable = ({
  members,
  showAddMemberButton,
  showEditMemberButton,
}: MembersTableProps) => {
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showUpdateModal, setShowUpdateModal] = useState<boolean>(false);
  const [initialValues, setInitialValues] = useState<TeamMember | undefined>();

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
            <TableRow>
              <TableCell colSpan={3}>
                <AddButton
                  onClick={() => {
                    setInitialValues(undefined);
                    setShowAddModal(true);
                  }}
                >
                  Add a new editor
                </AddButton>
              </TableCell>
            </TableRow>
          )}
        </Table>
        {showAddModal && (
          <EditorUpsertModal
            showModal={showAddModal}
            setShowModal={setShowAddModal}
            initialValues={initialValues}
            actionType={"add"}
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
              </TableCell>{" "}
              <TableCell></TableCell>
            </StyledTableRow>
          </TableHead>
          <TableBody
            data-testid={`members-table${showAddMemberButton && "-add-editor"}`}
          >
            {members.map((member, i) => (
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
<<<<<<< HEAD
                {showEditMemberButton && (
                  <Permission.IsPlatformAdmin>
                    <TableCell>
                      <EditUserButton
                        onClick={() => {
                          setShowUpdateModal(true);
                          setInitialValues(member);
                        }}
                        data-testId={`edit-button-${i}`}
                      >
                        Edit
                      </EditUserButton>
                    </TableCell>
                  </Permission.IsPlatformAdmin>
                )}
=======
                <Permission.IsPlatformAdmin>
                  <TableCell>
                    <EditUserButton
                      onClick={() => {
                        setShowUpdateModal(true);
                        setInitialValues(member);
                      }}
                      data-testId={`edit-button-${i}`}
                    >
                      Edit
                    </EditUserButton>
                  </TableCell>
                </Permission.IsPlatformAdmin>
                <Permission.IsPlatformAdmin>
                  <TableCell>
                    <RemoveUserButton
                      onClick={() => {
                        setShowUpdateModal(true);
                        setInitialValues(member);
                      }}
                      data-testId={`remove-button-${i}`}
                    >
                      Remove
                    </RemoveUserButton>
                  </TableCell>
                </Permission.IsPlatformAdmin>
>>>>>>> 1a9cc18b (init remove button work)
              </StyledTableRow>
            ))}
            {showAddMemberButton && (
              <Permission.IsPlatformAdmin>
                <TableRow>
                  <TableCell colSpan={3}>
                    <AddButton
                      onClick={() => {
                        setInitialValues(undefined);
                        setShowAddModal(true);
                      }}
                    >
                      Add a new editor
                    </AddButton>
                  </TableCell>
                </TableRow>
              </Permission.IsPlatformAdmin>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {showAddModal && (
        <EditorUpsertModal
          showModal={showAddModal}
          setShowModal={setShowAddModal}
          initialValues={initialValues}
          actionType={"add"}
        />
      )}
      {showUpdateModal && (
        <EditorUpsertModal
          showModal={showUpdateModal}
          setShowModal={setShowUpdateModal}
          initialValues={initialValues}
          userId={initialValues?.id || 1}
          actionType={"edit"}
        />
      )}
    </>
  );
};
