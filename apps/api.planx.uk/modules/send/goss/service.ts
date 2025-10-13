import { markSessionAsSubmitted } from "../../saveAndReturn/service/utils.js";

export const isTeamUsingGOSS = (team: string) => {
  // TODO: Query db for this
  const GOSS_TEAMS = ["west-berkshire"];
  return GOSS_TEAMS.includes(team);
};

export const createGOSSApplicationAuditRecord = async () => {
  console.log("TODO: Create audit record");
};

export const checkGOSSAuditTable = async (sessionId: string) => {
  console.log("TODO: Check GOSS audit table");
  return {
    id: "abc123",
  };
};

export const sendToGOSS = async (sessionId: string) => {
  const applicationData = {};
  // TODO: Post payload to GOSS

  await createGOSSApplicationAuditRecord();
  await markSessionAsSubmitted(sessionId);

  return applicationData;
};
