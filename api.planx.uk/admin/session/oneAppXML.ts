import { gql } from "graphql-request";
import { Request, Response, NextFunction } from "express";
import { adminGraphQLClient as client } from "../../hasura";

export const getOneAppXML = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const xml = await fetchSessionXML(req.params.sessionId);
    res.set("content-type", "text/xml");
    return res.send(xml);
  } catch (error) {
    return next({
      message: "Failed to get OneApp XML: " + (error as Error).message,
    });
  }
};

const fetchSessionXML = async (sessionId: string) => {
  try {
    const query = gql`
      query GetMostRecentUniformApplicationBySessionID(
        $submission_reference: String
      ) {
        uniform_applications(
          where: { submission_reference: { _eq: $submission_reference } }
          order_by: { created_at: desc }
          limit: 1
        ) {
          xml
        }
      }
    `;
    const { uniform_applications } = await client.request(query, {
      submission_reference: sessionId,
    });

    if (!uniform_applications?.length) throw Error("Invalid sessionID");

    return uniform_applications[0].xml;
  } catch (error) {
    throw Error("Unable to fetch session XML: " + (error as Error).message);
  }
};
