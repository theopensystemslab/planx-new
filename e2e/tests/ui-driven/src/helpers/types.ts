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
  user: Pick<User, "firstName" | "lastName" | "email" | "isPlatformAdmin" | "id">
  team: { id?: number } & NewTeam;
  flow?: Flow;
  externalPortalFlow?: Flow;
  sessionIds?: string[];
}
