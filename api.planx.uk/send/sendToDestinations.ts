import type { Request, Response } from "express";
import { queueSubmissions } from "./queue";
import type { Destination, SubmissionDestinations } from "./queue";

export async function sendToDestinations(
  req: Request,
  res: Response
): Promise<Response> {
  const sessionId = req.params.sessionId;

  const getLocalAuthority = (localAuthority: string) => {
    // allow e2e team to present as "lambeth"
    return localAuthority == "e2e" ? "lambeth" : localAuthority;
  };

  const getDestination = (destination: Destination) => ({
    [destination]: {
      localAuthority: getLocalAuthority(
        req.body[destination]?.localAuthority || ""
      ),
    },
  });

  const destinations: SubmissionDestinations = {};
  if (req.body.email) Object.assign(destinations, getDestination("email"));
  if (req.body.bops) Object.assign(destinations, getDestination("bops"));
  if (req.body.uniform) Object.assign(destinations, getDestination("uniform"));

  const responses = await queueSubmissions(sessionId, destinations);

  return res.json(responses);
}
