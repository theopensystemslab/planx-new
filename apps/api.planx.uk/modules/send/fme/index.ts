import { subDays } from "date-fns";
import type { NextFunction, Request, Response } from "express";
import { gql } from "graphql-request";
import { $api } from "../../../client/index.js";

export async function getSubmissionsController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const localAuthority = req.params?.localAuthority;
  if (!localAuthority) {
    return next({
      status: 400,
      message: "Missing values required to access submissions",
    });
  }

  try {
    const submissions = await getSubmissions(localAuthority);
    if (!submissions || submissions.length === 0) {
      return next({
        status: 400,
        message:
          "Failed to find submissions within the last 28 days for this local authority",
      });
    }

    res.status(200).json(submissions);
  } catch (error) {
    return next({
      error,
      message: `Failed to get submissions for ${localAuthority}. ${error}`,
    });
  }
}

interface GetS3Applications {
  submissions: {
    id: number;
    flowName: string;
    file: string;
    message: string;
    payloadType: string;
    submittedAt: string;
  }[];
}

async function getSubmissions(
  localAuthority: string,
): Promise<GetS3Applications["submissions"]> {
  // Return the last 28 days of submissions, same as in-editor 'Submissions' page download availability
  const minDate = subDays(new Date(), 28);

  const response = await $api.client.request<GetS3Applications>(
    gql`
      query GetS3Applications($teamSlug: String!, $createdAt: timestamptz!) {
        submissions: s3_applications(
          where: {
            created_at: { _gte: $createdAt }
            team_slug: { _eq: $teamSlug }
          }
        ) {
          id
          sessionId: session_id
          flowName: webhook_request(path: "data.service")
          file: webhook_request(path: "data.file")
          message: webhook_request(path: "data.message")
          payloadType: webhook_request(path: "data.payload")
          submittedAt: created_at
        }
      }
    `,
    {
      teamSlug: localAuthority,
      createdAt: minDate,
    },
  );

  return response?.submissions;
}
