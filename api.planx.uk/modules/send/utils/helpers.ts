import { getValidSchemaValues } from "@opensystemslab/planx-core";
import type { Passport } from "../../../types.js";

/**
 * Checks whether a session's passport data includes an application type supported by the ODP Schema
 * @param passport
 * @returns boolean
 */
export function isApplicationTypeSupported(passport: Passport): boolean {
  const userApplicationType = passport.data?.["application.type"]?.[0];
  if (!userApplicationType) return false;

  const statutoryApplicationTypes = getValidSchemaValues("ApplicationType");
  const preApplicationType = "preApp";
  const supportedApplicationTypes = (statutoryApplicationTypes || []).concat(
    preApplicationType,
  );

  return supportedApplicationTypes.includes(userApplicationType);
}
