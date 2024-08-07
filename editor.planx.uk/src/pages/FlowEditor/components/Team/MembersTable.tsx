import Chip from "@mui/material/Chip";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import React from "react";

import { StyledAvatar, StyledTableRow } from "./styles";
import { TeamMember } from "./types";

export const MembersTable: React.FC<{ members: TeamMember[] }> = ({
  members,
}) => {
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
        <TableBody>
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
        </TableBody>
      </Table>
    </TableContainer>
  );
};
