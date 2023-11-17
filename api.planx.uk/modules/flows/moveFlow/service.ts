import { gql } from "graphql-request";
import { Flow, Team } from "../../../types";
import { $public, getClient } from "../../../client";

export const moveFlow = async (flowId: string, teamSlug: string) => {
  const team = await $public.team.getBySlug(teamSlug);
  if (!team)
    throw Error(
      `Unable to find a team matching slug ${teamSlug}, exiting move`,
    );

  await updateFlow(flowId, team.id);
};

interface UpdateFlow {
  flow: Pick<Flow, "id">;
}

const updateFlow = async (
  flowId: Flow["id"],
  teamId: Team["id"],
): Promise<Flow["id"]> => {
  const { client: $client } = getClient();
  const { flow } = await $client.request<UpdateFlow>(
    gql`
      mutation UpdateFlow($id: uuid!, $team_id: Int!) {
        flow: update_flows_by_pk(
          pk_columns: { id: $id }
          _set: { team_id: $team_id }
        ) {
          id
        }
      }
    `,
    {
      id: flowId,
      team_id: teamId,
    },
  );

  return flow.id;
};
