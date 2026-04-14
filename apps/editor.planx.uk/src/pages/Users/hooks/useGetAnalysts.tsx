import { useQuery } from "@apollo/client";
import type { User } from "@opensystemslab/planx-core/types";
import type { TeamMember } from "pages/FlowEditor/components/Team/types";
import { userToTeamMember } from "pages/FlowEditor/components/Team/utils";

import { GET_ANALYSTS_QUERY } from "./queries";

export const useGetAnalysts = () => {
  const { data, loading, error } = useQuery<{ analysts: User[] }>(
    GET_ANALYSTS_QUERY,
  );

  const analysts: TeamMember[] = data?.analysts.map(userToTeamMember) ?? [];

  return {
    loading,
    error,
    analysts,
  };
};