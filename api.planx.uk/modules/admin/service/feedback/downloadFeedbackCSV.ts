import { gql } from "graphql-request";
import Axios from "axios";
import { stringify } from "csv-stringify";
import { Feedback, METADATA_KEYS, ParsedFeedback } from "./types";

export const generateFeedbackCSV = async (feedbackFishCookie: string) => {
  const feedback = await fetchFeedback(feedbackFishCookie);
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
  return csvStream;
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
