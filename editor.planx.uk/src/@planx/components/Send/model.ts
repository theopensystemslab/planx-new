import type { Store } from "../../../pages/FlowEditor/lib/store";
import { MoreInformation, parseMoreInformation } from "../shared";

export enum Destination {
  BOPS = "bops",
  Uniform = "uniform",
  Email = "email",
}

export interface Send extends MoreInformation {
  title: string;
  destinations: Destination[];
}

export const DEFAULT_TITLE = "Send";
export const DEFAULT_DESTINATION = Destination.Email;

export const parseContent = (data: Record<string, any> | undefined): Send => ({
  ...parseMoreInformation(data),
  title: data?.title || DEFAULT_TITLE,
  destinations: data?.destinations || [DEFAULT_DESTINATION],
});

export function getCombinedEventsPayload({
  destinations,
  teamSlug,
  passport,
  sessionId,
}: {
  destinations: Destination[];
  teamSlug: string;
  passport: Store.passport;
  sessionId: string;
}) {
  const combinedEventsPayload: any = {};

  // Format application user data as required by BOPS
  if (destinations.includes(Destination.BOPS)) {
    combinedEventsPayload[Destination.BOPS] = {
      localAuthority: teamSlug,
      body: { sessionId },
    };
  }

  if (destinations.includes(Destination.Email)) {
    combinedEventsPayload[Destination.Email] = {
      localAuthority: teamSlug,
      body: { sessionId },
    };
  }

  // Format application user data as required by Idox/Uniform
  if (destinations.includes(Destination.Uniform)) {
    let uniformTeamSlug = teamSlug;
    // Bucks has 3 instances of Uniform for 4 legacy councils, set teamSlug to pre-merger council name
    if (uniformTeamSlug === "buckinghamshire") {
      uniformTeamSlug = passport.data?.["property.localAuthorityDistrict"]
        ?.filter((name: string) => name !== "Buckinghamshire")[0]
        ?.toLowerCase()
        ?.replace(/\W+/g, "-");

      // South Bucks & Chiltern share an Idox connector, route addresses in either to Chiltern
      if (uniformTeamSlug === "south-bucks") {
        uniformTeamSlug = "chiltern";
      }
    }

    combinedEventsPayload[Destination.Uniform] = {
      localAuthority: uniformTeamSlug,
      body: { sessionId },
    };
  }

  return combinedEventsPayload;
}
