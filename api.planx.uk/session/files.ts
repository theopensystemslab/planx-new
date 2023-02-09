import { gql } from "graphql-request";
import { adminGraphQLClient as adminClient } from "../hasura";
import { Passport } from "../types";
import has from "lodash/has";

type Question = Record<string, any>[];

export const getFilesForSession = async (sessionId: string): Promise<string[]> => {
  const passportData = await getPassportDataForSession(sessionId);
  if (!passportData) return [];
  
  const files = extractFileURLsFromPassportData(passportData);
  return files;
}

const getPassportDataForSession = async (sessionId: string): Promise<Passport["data"]> => {
  try {
    const query = gql`
      query GetPassportDataForSession($sessionId: uuid!) {
        lowcal_sessions_by_pk(id: $sessionId) {
          data(path: "passport.data")
        }
      }
    `;
    const {
      lowcal_sessions_by_pk: {
        data: passportData
      }
    } = await adminClient.request(query, { sessionId });
    return passportData;
  } catch (error) {
    throw new Error(`Error fetching Passport Data for session ${sessionId}`);
  }
}

export const extractFileURLsFromPassportData = (passportData: Record<string, any>) => {
  const isFileUploadQuestion = (question: Question) => has(question[0], "url");
  const getFileURLs = (questionWithFiles: Question) => questionWithFiles.map(question => question.url);

  const files = Object.values(passportData)
    .filter(isFileUploadQuestion)
    .map(getFileURLs)
    .flat();
  return files;
}
