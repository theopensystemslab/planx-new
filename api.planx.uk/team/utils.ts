import { adminGraphQLClient as adminClient } from "../hasura";
import { gql } from "graphql-request";
import { Team } from "../types";

export const getTeamForSession = async (
  sessionId: string,
): Promise<Pick<Team, "id" | "boundaryBBox">> => {
  const data = await adminClient.request(
    gql`
      query GetTeamForSession($sessionId: uuid!) {
        session: lowcal_sessions_by_pk(id: $sessionId) {
          flow {
            team {
              id
              boundaryBBox: boundary_bbox
            }
          }
        }
      }
    `,
    { sessionId },
  );

  return data.session.flow.team;
};
