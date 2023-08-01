import { gql } from "graphql-request";
import { Request, Response, NextFunction } from "express";
import Axios from "axios";
import { stringify } from "csv-stringify";

export interface Feedback {
  id: number;
  text: string;
  category: string;
  createdAt: string;
  location: string;
  screenshotUrl: string;
  device: Device;
  metadata?: Metadata[];
}

const METADATA_KEYS = [
  "address",
  "uprn",
  "title",
  "data",
  "service",
  "team",
  "component-metadata",
  "reason",
  "project-type",
  "breadcrumbs",
] as const;

type MetadataKey = (typeof METADATA_KEYS)[number];

interface Metadata {
  key: MetadataKey;
  value: string | Record<string, string>;
}

interface Device {
  client: Client;
  os: Os;
}

interface Client {
  name: string;
  version: string;
}

interface Os {
  name: string;
  version: string;
}

type ParsedFeedback = Feedback & {
  [key in MetadataKey]?: string | Record<string, string>;
};

/**
 * @swagger
 * /admin/feedback:
 *  get:
 *    summary: Downloads the FeedbackFish CSV
 *    description: Downloads the FeedbackFish CSV
 *    tags:
 *      - admin
 *    parameters:
 *      - in: path
 *        name: sessionId
 *        type: string
 *        required: true
 *        description: Session id
 */
export const downloadFeedbackCSV = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.query.cookie)
    return next({ status: 401, message: "Missing cookie" });

  try {
    const feedback = await fetchFeedback(req.query.cookie as string);
    const parsedFeedback = parseFeedback(feedback);
    const csvStream = stringify(parsedFeedback, {
      header: true,
      columns: [
        "id",
        "text",
        "category",
        "createdAt",
        "location",
        "screenshotUrl",
        "device",
        ...METADATA_KEYS,
      ],
    });
    res.header("Content-type", "text/csv");
    csvStream.pipe(res);
  } catch (error) {
    return next({
      message:
        "Failed to generate FeedbackFish CSV: " + (error as Error).message,
    });
  }
};

const fetchFeedback = async (cookie: string): Promise<Feedback[]> => {
  const feedbackFishGraphQLEndpoint = "https://graphcdn.api.feedback.fish/";
  const body = {
    query: gql`
      query getFeedback($projectId: String!) {
        feedback(projectId: $projectId) {
          id
          text
          category
          createdAt
          location
          screenshotUrl
          metadata {
            key
            value
          }
          device {
            client {
              name
              version
            }
            os {
              name
              version
            }
          }
        }
      }
    `,
    operationName: "getFeedback",
    variables: {
      projectId: "65f02de00b90d1",
    },
  };

  try {
    const result = await Axios.post(feedbackFishGraphQLEndpoint, body, {
      headers: { cookie },
    });
    const feedback: Feedback[] = result.data.data.feedback;
    return feedback;
  } catch (error) {
    throw Error(
      "Failed to connect to FeedbackFish: " + (error as Error).message,
    );
  }
};

const generateMetadata = (feedback: ParsedFeedback): ParsedFeedback => {
  // Transform metadata into kv pairs
  feedback.metadata?.forEach(({ key, value }) => (feedback[key] = value));
  // Drop redundant raw metadata
  delete feedback.metadata;
  return feedback;
};

export const parseFeedback = (feedback: Feedback[]): ParsedFeedback[] => {
  const parsedFeedback: ParsedFeedback[] = [...feedback];
  parsedFeedback.map(generateMetadata);
  return parsedFeedback;
};
