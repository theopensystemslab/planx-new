import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useState } from "react";
import SettingsSection from "ui/editor/SettingsSection";
import ErrorSummary from "ui/shared/ErrorSummary/ErrorSummary";

import { MembersTable } from "./components/MembersTable";
import { useTeamManagementPermissions } from "./hooks/useTeamManagementPermissions";
import { useTeamMembers } from "./hooks/useTeamMembers";

interface AccordionProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Accordion = ({ isOpen, onToggle }: AccordionProps) => {
  const ChevronIcon = isOpen ? ExpandLessIcon : ExpandMoreIcon;
  return (
    <IconButton
      onClick={onToggle}
      sx={{ border: "none" }}
      data-testid={"platform-admins-toggle"}
    >
      <ChevronIcon sx={{ fontSize: "2rem" }} />
    </IconButton>
  );
};

export const TeamMembers = () => {
  const teamSlug = useStore((state) => state.teamSlug);

  const { platformAdmins, activeMembers, archivedMembers, loading, error } =
    useTeamMembers(teamSlug);
  const {
    canManageActiveMembers,
    canManageTeamAdmins,
    canManagePlatformAdmins,
  } = useTeamManagementPermissions();
  const [openAccordion, setOpenAccordion] = useState(false);

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
        {activeMembers && (
          <MembersTable
            members={activeMembers}
            showAddMemberButton={canManageActiveMembers}
            showEditMemberButton={canManageActiveMembers}
            showRemoveMemberButton={canManageActiveMembers}
            showTeamAdminSwitch={canManagePlatformAdmins || canManageTeamAdmins}
          />
        )}
      </SettingsSection>
      <SettingsSection>
        <Box sx={{ display: "flex" }}>
          <Typography variant="h2" component="h3" gutterBottom>
            Platform admins
          </Typography>
          <Accordion
            isOpen={openAccordion}
            onToggle={() => setOpenAccordion((prev) => !prev)}
          />
        </Box>
        <Typography variant="body1">
          Platform admins have editor access across all teams. Expand to view.
        </Typography>
        {openAccordion && (
          <>
            {loading && <DelayedLoadingIndicator />}
            {platformAdmins && (
              <MembersTable
                members={platformAdmins}
                showEditMemberButton={canManagePlatformAdmins}
              />
            )}
          </>
        )}
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
