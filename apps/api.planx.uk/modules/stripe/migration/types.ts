import type { Team } from "@opensystemslab/planx-core/types";
import { z } from "zod";

import type { ValidatedRequestHandler } from "../../../shared/middleware/validate.js";

export const canMigrateSchema = z.object({
  params: z.object({ teamSlug: z.string() }),
});

export type TeamLocals = { team: Team };

export type MigrationBlockerReason =
  "stripeNotConnected" | "activeGovpaySessions" | "checkoutNotConfigured";

export interface MigrationBlocker {
  reason: MigrationBlockerReason;
  /** conditional because it will only show for activeGovpaySessions */
  count?: number;
}

export interface CanMigrateResponse {
  canMigrate: boolean;
  blockers: MigrationBlocker[];
}

export type GetCanMigrateController = ValidatedRequestHandler<
  typeof canMigrateSchema,
  CanMigrateResponse,
  TeamLocals
>;
