import type { User } from "@opensystemslab/planx-core/types";

// Platform analysts without admin access are limited to the admin panel
export const isAnalystOnly = (user: User | undefined | null): boolean =>
  Boolean(user?.isAnalyst && !user.isPlatformAdmin);
