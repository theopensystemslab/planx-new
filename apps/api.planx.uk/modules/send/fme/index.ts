import { subDays } from "date-fns";
import { gql } from "graphql-request";
import { z } from "zod";
import { $api } from "../../../client/index.js";
import type { ValidatedRequestHandler } from "../../../shared/middleware/validate.js";

export const getSubmissionsSchema = z.object({
  params: z.object({
    localAuthority: z.string(),
  }),
});

type GetSubmissionsController = ValidatedRequestHandler<
  typeof getSubmissionsSchema,
  unknown
>;

export const getSubmissionsController: GetSubmissionsController = async (
  _req,
  res,
  next,
) => {
  const localAuthority = res.locals.parsedReq.params.localAuthority;

  try {
    const submissions = await getSubmissions(localAuthority);
    if (!submissions || submissions.length === 0) {
      // No submissions found within the last 28 days for this local authority
      res.status(204).json();
    }

    res.status(200).json(submissions);
  } catch (error) {
    return next({
      error,
      message: `Failed to get submissions for ${localAuthority}. ${error}`,
    });
  }
};

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
