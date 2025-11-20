import type { GISResponse } from "@opensystemslab/planx-core/types";

export type GISResponseWithAudit = GISResponse & { planxRequest: string };
