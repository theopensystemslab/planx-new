import type { TeamTheme } from "@opensystemslab/planx-core/types";
import type { SnakeCasedProperties } from "type-fest";

export type FormValues = Pick<TeamTheme, "actionColour">;

export interface MutationVars {
  teamId: number;
  theme: SnakeCasedProperties<FormValues>;
}
