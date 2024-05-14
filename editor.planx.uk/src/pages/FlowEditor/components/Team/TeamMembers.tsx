import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
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

interface Props {
  teamMembersByRole: Record<string, TeamMember[]>;
}

export const TeamMembers: React.FC<Props> = ({ teamMembersByRole }) => {
  const platformAdmins = teamMembersByRole.platformAdmin || [];
  const otherRoles = Object.keys(teamMembersByRole)
    .filter((role) => role !== "platformAdmin")
    .reduce((acc: TeamMember[], role) => {
      return acc.concat(teamMembersByRole[role]);
    }, []);

  return (
    <Container maxWidth="contentWrap">
      <Box py={7}>
        <EditorRow>
          <Typography variant="h2" component="h3" gutterBottom>
            Team members
          </Typography>
          <Typography variant="body1">
            Team members have access to edit your flows and services.
          </Typography>
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
                {otherRoles.map((member) => (
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
                        label={member.role}
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
        </EditorRow>
        <EditorRow>
          <Typography variant="h2" component="h3" gutterBottom>
            Platform admins
          </Typography>
          <Typography variant="body1">
            Admins have editor access across all teams.
          </Typography>
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
                {platformAdmins.map((member) => (
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
                        label={member.role}
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
        </EditorRow>
        <EditorRow>
          <Typography variant="h2" component="h3" gutterBottom>
            Archived team members
          </Typography>
          <Typography variant="body1">
            Past members who no longer have access to your team.
          </Typography>
        </EditorRow>
      </Box>
    </Container>
  );
};
