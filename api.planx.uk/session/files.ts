import { Passport } from "@opensystemslab/planx-core";
import { $admin } from "../client";

export const getFilesForSession = async (
  sessionId: string,
): Promise<string[]> => {
  const session = await $admin.session.find(sessionId);
  if (!session?.data.passport?.data) return [];

  const files = new Passport(session.data.passport).files();
  return files;
};
