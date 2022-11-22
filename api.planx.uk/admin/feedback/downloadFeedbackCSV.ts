import { gql } from "graphql-request";
import { Request, Response, NextFunction } from "express";
import Axios from "axios";
import { stringify } from "csv-stringify";

interface Feedback {
  id: number
  text: string
  category: string
  createdAt: string
  location: string
  screenshotUrl: string
  device: Device
  metadata?: Metadata[]
}

type MetadataKey = "address" | "uprn" | "title" | "data" | "service" | "team"

interface Metadata {
  key: MetadataKey
  value: string | Record<string, string>
}

interface Device {
  client: Client
  os: Os
}

interface Client {
  name: string
  version: string
}

interface Os {
  name: string
  version: string
}

type ParsedFeedback = Feedback & {
  [key in MetadataKey]?: string | Record<string, string>
}

interface QueryParams {
  cookie: string
  projectId: string
}

export const downloadFeedbackCSV = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user?.sub)
    return next({ status: 401, message: "User ID missing from JWT" });

  if (!req.query.cookie || !req.query.projectId)
    return next({ status: 401, message: "Missing cookie and/or projectId" });

  const { cookie, projectId } = req.query as unknown as QueryParams;

  try {
    const feedback = await fetchFeedback(cookie, projectId);
    const parsedFeedback = parseFeedback(feedback);
    const csvStream = stringify(parsedFeedback, { header: true })
    res.header("Content-type", "text/csv");
    csvStream.pipe(res);
  } catch (error) {
    return next({ message: "Failed to generate FeedbackFish CSV: " + (error as Error).message });
  }
};

const fetchFeedback = async (cookie: string, projectId: string): Promise<Feedback[]> => {
  const feedbackFishGraphQLEndpoint = "https://graphcdn.api.feedback.fish/"
  const body = {
    query: gql`query getFeedback($projectId: String!) { 
      feedback(projectId: $projectId) { 
        id text category createdAt location screenshotUrl 
        metadata { key value } 
        device { 
          client { name  version } 
          os { name version } 
        } 
      } 
    }`,
    operationName: "getFeedback",
    variables: {
      projectId: projectId
    }
  }

  try {
    const result = await Axios.post(feedbackFishGraphQLEndpoint, body, { headers: { cookie } });
    const feedback: Feedback[] = result.data.data.feedback;
    return feedback;
  } catch (error) {
    throw Error("Failed to connect to FeedbackFish: " + (error as Error).message)
  }
};

const parseFeedback = (feedback: Feedback[]): ParsedFeedback[] => {
  const parsedFeedback: ParsedFeedback[] = [...feedback];
  return parsedFeedback.map(item => {
    item.metadata?.forEach(({ key, value }) => item[key] = value);
    delete item.metadata;
    return item;
  })
};