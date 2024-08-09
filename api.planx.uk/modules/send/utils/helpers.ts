import { Passport } from "../../../types.js";

/**
 * Checks whether a session's passport data includes an application type supported by the ODP Schema
 * @param passport
 * @returns boolean
 */
export function isApplicationTypeSupported(passport: Passport): boolean {
  // Prefixes of application types that are supported by the ODP Schema
  //   TODO in future look up via schema type definitions
  const supportedAppTypes = ["ldc", "listed", "pa", "pp"];

  const appType = passport.data?.["application.type"]?.[0];
  const appTypePrefix = appType?.split(".")?.[0];

  return supportedAppTypes.includes(appTypePrefix);
}
