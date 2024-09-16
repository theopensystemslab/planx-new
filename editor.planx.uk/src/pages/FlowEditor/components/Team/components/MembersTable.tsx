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
import { EditorUpsertModal } from "./AddNewEditorModal";

const TableButton = styled(Button)(({ theme }) => ({
  color: theme.palette.primary.main,
  textDecoration: "underline",
  boxShadow: "none",
  "&:hover": {
    boxShadow: "none",
    color: theme.palette.primary.main,
    textDecoration: "underline",
  },
}));

export const MembersTable = ({
  members,
  showAddMemberButton,
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
                <Permission.IsPlatformAdmin>
                  <TableCell>
                    <TableButton
                      onClick={() => {
                        setShowUpdateModal(true);
                        setInitialValues(member);
                      }}
                      data-testId={`edit-button-${i}`}
                    >
                      Edit
                    </TableButton>
                  </TableCell>
                </Permission.IsPlatformAdmin>
              </StyledTableRow>
            ))}
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
