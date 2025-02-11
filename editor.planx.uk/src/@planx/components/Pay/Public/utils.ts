import { GOV_UK_PAY_URL } from "../model";

export function getGovUkPayUrlForTeam({
  sessionId,
  flowId,
  teamSlug,
  paymentId,
}: {
  sessionId: string;
  flowId: string;
  teamSlug: string;
  paymentId?: string;
}): string {
  const baseURL = `${GOV_UK_PAY_URL}/${teamSlug}`;
  const queryString = `?sessionId=${sessionId}&flowId=${flowId}`;
  if (paymentId) {
    return `${baseURL}/${paymentId}${queryString}`;
  }
  return `${baseURL}${queryString}`;
}
