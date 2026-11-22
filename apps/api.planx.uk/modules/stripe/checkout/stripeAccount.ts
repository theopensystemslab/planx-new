import type { Session } from "@opensystemslab/planx-core/types";

import type { StripeAccount } from "../connect/service.js";

type PassportData = Session["data"]["passport"]["data"];

export type StripeAccountSelection =
  | { account: StripeAccount }
  | {
      refusal: "noAccount" | "noMatchingAccount" | "multipleMatchingAccounts";
    };

const normalise = (name: string) => name.trim().toLowerCase();

/**
 * The site's local authority districts, set by FindProperty
 * A list, as a site on a boundary can be in more than one
 */
export const getLocalAuthorityDistricts = (
  passportData: PassportData | undefined,
): string[] => {
  const value = passportData?.["property.localAuthorityDistrict"];
  const districts = Array.isArray(value) ? value : [value];
  return districts.filter(
    (district): district is string => typeof district === "string",
  );
};

/**
 * Choose which of the team's accounts takes a payment
 *
 * A team with a single account always uses it, whatever its name
 * A team with multiple accounts uses the account named after the site's local authority district (ignoring case)
 * There's no fallback - no district, no matching account, or a site matching several accounts is refused
 */
export const selectStripeAccount = (
  accounts: StripeAccount[],
  districts: string[],
): StripeAccountSelection => {
  if (accounts.length === 0) return { refusal: "noAccount" };
  if (accounts.length === 1) return { account: accounts[0] };

  const siteDistricts = new Set(districts.map(normalise));
  const matches = accounts.filter(({ name }) =>
    siteDistricts.has(normalise(name)),
  );

  if (matches.length === 1) return { account: matches[0] };

  return {
    refusal: matches.length ? "multipleMatchingAccounts" : "noMatchingAccount",
  };
};
