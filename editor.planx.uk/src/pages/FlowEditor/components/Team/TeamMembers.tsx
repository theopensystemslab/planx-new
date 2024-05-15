import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { Role, User } from "@opensystemslab/planx-core/types";
import React from "react";
import EditorRow from "ui/editor/EditorRow";

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  background: theme.palette.background.dark,
  color: theme.palette.common.white,
  fontSize: "1em",
  fontWeight: "600",
  marginRight: theme.spacing(1),
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-child(even)": {
    background: theme.palette.background.paper,
  },
}));

export type TeamMember = Omit<User, "teams" | "isPlatformAdmin"> & {
  role: Role;
};

const roleLabels: Record<string, string> = {
  platformAdmin: "Admin",
  teamEditor: "Editor",
  teamViewer: "Viewer",
};

interface Props {
  teamMembersByRole: Record<string, TeamMember[]>;
}

export const TeamMembers: React.FC<Props> = ({ teamMembersByRole }) => {
  const platformAdmins = (teamMembersByRole.platformAdmin || []).filter(
    (member) => member.email,
  );
  const otherRoles = Object.keys(teamMembersByRole)
    .filter((role) => role !== "platformAdmin")
    .reduce((acc: TeamMember[], role) => {
      return acc.concat(teamMembersByRole[role]);
    }, []);

  const archivedMembers = otherRoles.filter(
    (member) => member.role !== "platformAdmin" && !member.email,
  );

  const getRoleLabel = (role: string) => {
    return roleLabels[role] || role;
  };

  const renderMemberTable = (members: TeamMember[]) => {
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

  return (
    <Container maxWidth="contentWrap">
      <Box py={7}>
        <EditorRow>
          <Typography variant="h2" component="h3" gutterBottom>
            Team editors
          </Typography>
          <Typography variant="body1">
            Editors have access to edit your services.
          </Typography>
          {renderMemberTable(otherRoles)}
        </EditorRow>
        <EditorRow>
          <Typography variant="h2" component="h3" gutterBottom>
            Admins
          </Typography>
          <Typography variant="body1">
            Admins have editor access across all teams.
          </Typography>
          {renderMemberTable(platformAdmins)}
        </EditorRow>
        {archivedMembers.length > 0 && (
          <EditorRow>
            <Typography variant="h2" component="h3" gutterBottom>
              Archived team editors
            </Typography>
            <Typography variant="body1">
              Past team members who no longer have access to the Editor, but may
              be part of the edit history of your services.
            </Typography>
            {renderMemberTable(archivedMembers)}
          </EditorRow>
        )}
      </Box>
    </Container>
  );
};
