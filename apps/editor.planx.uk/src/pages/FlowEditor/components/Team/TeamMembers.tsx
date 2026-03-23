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

export const TeamMembers = ({ teamMembers }: { teamMembers: TeamMember[] }) => {
  const [teamSlug] = useStore((state) => [state.teamSlug]);

  // All users are automatically added to Templates team via a db trigger, we never want to manually add/edit them
  const isNotTemplatesTeam = teamSlug !== "templates";

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
      <SettingsSection data-testid="team-members">
        <Typography variant="h2" component="h3" gutterBottom>
          Team members
        </Typography>
        <Typography variant="body1">
          Editors have access to edit your flows, whilst viewers can only browse
          your flows.
        </Typography>
        <MembersTable
          members={activeMembers}
          showAddMemberButton={isNotTemplatesTeam}
          showEditMemberButton={isNotTemplatesTeam}
          showRemoveMemberButton={isNotTemplatesTeam}
        />
      </SettingsSection>
      <SettingsSection>
        <Typography variant="h2" component="h3" gutterBottom>
          Admins
        </Typography>
        <Typography variant="body1">
          Admins have editor access across all teams.
        </Typography>
        <MembersTable
          members={platformAdmins}
          showEditMemberButton={isNotTemplatesTeam}
        />
      </SettingsSection>
      {archivedMembers.length > 0 && (
        <SettingsSection data-testid="archived-members">
          <Typography variant="h2" component="h3" gutterBottom>
            Archived team editors
          </Typography>
          <Typography variant="body1">
            Past team members who no longer have access to the Editor, but may
            still appear in the edit history of your flows.
          </Typography>
          <MembersTable members={archivedMembers} />
        </SettingsSection>
      )}
    </Container>
  );
};
