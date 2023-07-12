import { Passport } from "@opensystemslab/planx-core";
import { gql } from "graphql-request";
import { adminGraphQLClient as adminClient } from "../hasura";
import { Passport as IPassport } from "../types";

export const getFilesForSession = async (
  sessionId: string,
): Promise<string[]> => {
  const passportData = await getPassportDataForSession(sessionId);
  if (!passportData) return [];

  const files = new Passport(passportData).getFiles();
  return files;
};

const getPassportDataForSession = async (
  sessionId: string,
): Promise<IPassport["data"]> => {
  try {
    const query = gql`
      query GetPassportDataForSession($sessionId: uuid!) {
        lowcal_sessions_by_pk(id: $sessionId) {
          data(path: "passport.data")
        }
      }
    `;
    const {
      lowcal_sessions_by_pk: { data: passportData },
    } = await adminClient.request(query, { sessionId });
    return passportData;
  } catch (error) {
    throw new Error(`Error fetching Passport Data for session ${sessionId}`);
  }
};
