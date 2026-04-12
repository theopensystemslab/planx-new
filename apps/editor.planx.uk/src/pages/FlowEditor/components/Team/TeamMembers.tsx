import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import SettingsSection from "ui/editor/SettingsSection";
import ErrorSummary from "ui/shared/ErrorSummary/ErrorSummary";

import { MembersTable } from "./components/MembersTable";
import { useTeamManagementPermissions } from "./hooks/useTeamManagementPermissions";
import { useTeamMembers } from "./hooks/useTeamMembers";

export const TeamMembers = () => {
  const teamSlug = useStore((state) => state.teamSlug);

  const { platformAdmins, activeMembers, archivedMembers, loading, error } = useTeamMembers(teamSlug);
  const { canManageActiveMembers, canManageAdmins } = useTeamManagementPermissions();

  if (error) return <ErrorSummary message={error.message} />;

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
        {loading && <DelayedLoadingIndicator />}
        {activeMembers &&
          <MembersTable
            members={activeMembers}
            showAddMemberButton={canManageActiveMembers}
            showEditMemberButton={canManageActiveMembers}
            showRemoveMemberButton={canManageActiveMembers}
          />
        }
      </SettingsSection>
      <SettingsSection>
        <Typography variant="h2" component="h3" gutterBottom>
          Admins
        </Typography>
        <Typography variant="body1">
          Admins have editor access across all teams.
        </Typography>
        {loading && <DelayedLoadingIndicator />}
        {platformAdmins &&
          <MembersTable
            members={platformAdmins}
            showEditMemberButton={canManageAdmins}
          />
        }
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
