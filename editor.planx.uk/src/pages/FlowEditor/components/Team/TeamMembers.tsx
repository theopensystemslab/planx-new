import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import React from "react";
import SettingsSection from "ui/editor/SettingsSection";

import { MembersTable } from "./MembersTable";
import { Props, TeamMember } from "./types";

export const TeamMembers: React.FC<Props> = ({ teamMembersByRole }) => {
  const platformAdmins = (teamMembersByRole.platformAdmin || []).filter(
    (member) => member.email,
  );
  const otherRoles = Object.keys(teamMembersByRole)
    .filter((role) => role !== "platformAdmin")
    .reduce((acc: TeamMember[], role) => {
      return acc.concat(teamMembersByRole[role]);
    }, []);

  const activeMembers = otherRoles.filter((member) => member.email);

  const archivedMembers = otherRoles.filter(
    (member) => member.role !== "platformAdmin" && !member.email,
  );

  return (
    <Container maxWidth="contentWrap">
      <SettingsSection>
        <Typography variant="h2" component="h3" gutterBottom>
          Team editors
        </Typography>
        <Typography variant="body1">
          Editors have access to edit your services.
        </Typography>
        <MembersTable members={activeMembers} />
      </SettingsSection>
      <SettingsSection>
        <Typography variant="h2" component="h3" gutterBottom>
          Admins
        </Typography>
        <Typography variant="body1">
          Admins have editor access across all teams.
        </Typography>
        <MembersTable members={platformAdmins} />
      </SettingsSection>
      {archivedMembers.length > 0 && (
        <SettingsSection>
          <Typography variant="h2" component="h3" gutterBottom>
            Archived team editors
          </Typography>
          <Typography variant="body1">
            Past team members who no longer have access to the Editor, but may
            be part of the edit history of your services.
          </Typography>
          <MembersTable members={archivedMembers} />
        </SettingsSection>
      )}
    </Container>
  );
};
