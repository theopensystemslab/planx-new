import Box from "@mui/material/Box";
import { Role, User } from "@opensystemslab/planx-core/types";
import React from "react";

export type TeamMember = Omit<User, "teams" | "isPlatformAdmin"> & {
  role: Role;
};

interface Props {
  teamMembersByRole: Record<Role, TeamMember[]>;
}

export const TeamMembers: React.FC<Props> = ({ teamMembersByRole }) => {
  return (
    <Box component="pre" sx={{ fontSize: 12 }}>
      {JSON.stringify(teamMembersByRole, null, 4)}
    </Box>
  );
};
