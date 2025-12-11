import type { TeamTheme } from "@opensystemslab/planx-core/types";
import type { SnakeCasedProperties } from "type-fest";

export type FormValues = Pick<TeamTheme, "primaryColour" | "logo">;

export interface MutationVars {
  teamId: number;
  theme: SnakeCasedProperties<FormValues>;
}
