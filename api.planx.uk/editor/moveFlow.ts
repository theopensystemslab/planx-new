import { Request, Response, NextFunction } from "express";
import { gql } from 'graphql-request';
import { adminGraphQLClient as client } from "../hasura";
import { Flow, Team } from "../types";

const moveFlow = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | NextFunction | void> => {
  try {
    if (!req.user?.sub) {
      return next({ status: 401, message: "User ID missing from JWT" });
    }

    if (!req.params?.flowId || !req.params?.teamSlug) {
      return next({ status: 400, message: "Missing required values to proceed" });
    }

    // Translate teamSlug to teamId
    const teamId = await getTeamIdBySlug(req.params.teamSlug);
    
    // If we have a valid teamId, update the flow record
    if (teamId) {
      await updateFlow(req.params.flowId, teamId);
      res.status(200).send({
        message: `Successfully moved flow to ${req.params.teamSlug}`,
      });
    } else {
      return next({
        status: 400,
        message: `Unable to find a team matching slug ${req.params.teamSlug}, exiting move`,
      });
    }
  } catch (error) {
    return next(error);
  }
};

const getTeamIdBySlug = async (slug: Team["slug"]): Promise<Team["id"]> => {
  const data = await client.request(
    gql`
      query GetTeam ($slug: String!) {
        teams(where: {
          slug: { _eq: $slug }
        }) {
          id
        }
      }
    `,
    {
      slug: slug,
    },
  );

  return data?.teams[0].id;
};

const updateFlow = async (flowId: Flow["id"], teamId: Team["id"]): Promise<Flow["id"]> => {
  const data = await client.request(
    gql`
      mutation UpdateFlow ($id: uuid!, $team_id: Int!) {
        update_flows_by_pk(
          pk_columns: { id: $id }, 
          _set: { team_id: $team_id }
        ) {
          id
        }
      }
    `,
    {
      id: flowId,
      team_id: teamId,
    }
  );

  return data?.update_flows_by_pk?.id;
};

export { moveFlow };


