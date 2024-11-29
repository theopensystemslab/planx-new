import { CoreDomainClient } from "@opensystemslab/planx-core";
import { User } from "@opensystemslab/planx-core/dist/types";

type NewTeam = Parameters<CoreDomainClient["team"]["create"]>[0];

export interface Flow {
  id?: string;
  publishedId?: number;
  slug: string;
  name: string;
  data?: object;
}

export interface TestContext {
  user: Omit<User, "teams">;
  team: { id?: number } & NewTeam;
  flow?: Flow;
  externalPortalFlow?: Flow;
  sessionIds?: string[];
}
