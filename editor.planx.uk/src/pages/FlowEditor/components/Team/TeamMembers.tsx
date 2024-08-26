import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { Role } from "@opensystemslab/planx-core/types";
import { groupBy } from "lodash";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import SettingsSection from "ui/editor/SettingsSection";

import {
  filterByEmailPresent,
  filterExcludingPlatformAdmins,
  hasEmailPresent,
} from "./components/lib/filterTeamMembers";
import { MembersTable } from "./components/MembersTable";
import { TeamMember } from "./types";

export const TeamMembers = () => {
  const teamMembers = useStore((state) => state.teamMembers);

  const teamMembersByRole = groupBy(teamMembers, "role") as Record<
    Role,
    TeamMember[]
  >;

  const platformAdmins =
    teamMembersByRole.platformAdmin.filter(hasEmailPresent);

  const otherRoles = filterExcludingPlatformAdmins(teamMembers);

  const activeMembers = filterByEmailPresent(otherRoles);

  const archivedMembers: TeamMember[] = otherRoles.filter(
    (member) => !hasEmailPresent(member),
  );

  return (
    <Container maxWidth="contentWrap">
      <SettingsSection testId="team-editors">
        <Typography variant="h2" component="h3" gutterBottom>
          Team editors
        </Typography>
        <Typography variant="body1">
          Editors have access to edit your services.
        </Typography>
        <MembersTable members={activeMembers} showAddMemberButton />
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
