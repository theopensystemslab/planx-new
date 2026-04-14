import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import { MembersTable } from "pages/FlowEditor/components/Team/components/MembersTable";
import React from "react";
import { useToggle } from "react-use";
import { AddButton } from "ui/editor/AddButton";
import SettingsSection from "ui/editor/SettingsSection";
import ErrorSummary from "ui/shared/ErrorSummary/ErrorSummary";

import { AddAnalystModal } from "./components/AddAnalystModal";
import { useGetAnalysts } from "./hooks/useGetAnalysts";

export const UserManagement = () => {
  const { analysts, loading, error } = useGetAnalysts();
  const [showAddAnalystModal, toggleAddAnalystModal] = useToggle(false);

  if (error) return <ErrorSummary message={error.message} />; 

  // Filtering out active analysts allows the MembersTable to responsively update when an analyst is removed
  const activeAnalysts = analysts.filter(({ email }) => email);

  return (
    <Container maxWidth="contentWrap">
      <SettingsSection data-testid="team-members">
        <Typography variant="h2" component="h3" gutterBottom>
          Analysts
        </Typography>
        <Typography variant="body1">
          Analysts have access to global dashboards and analytics, but cannot create, update, or delete flows.
        </Typography>
        {loading && <DelayedLoadingIndicator />}
        {activeAnalysts &&
        <>
          <MembersTable
            members={activeAnalysts}
            showEditMemberButton
            showRemoveMemberButton
          />
          <Box m={1}>
           <AddButton onClick={toggleAddAnalystModal}>Add a new analyst</AddButton>
          </Box>
          {showAddAnalystModal && <AddAnalystModal onClose={toggleAddAnalystModal}/>}
        </>
        }
      </SettingsSection>
    </Container>

  )
}