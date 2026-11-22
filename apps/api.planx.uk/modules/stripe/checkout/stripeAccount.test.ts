import {
  getLocalAuthorityDistricts,
  selectStripeAccount,
} from "./stripeAccount.js";

const lambeth = { name: "Lambeth", accountId: "acct_lambeth" };

const adur = { name: "Adur", accountId: "acct_adur" };
const worthing = { name: "Worthing", accountId: "acct_worthing" };

describe("selectStripeAccount", () => {
  describe("for a team with a single account", () => {
    it("always uses it, without needing a district", () => {
      expect(selectStripeAccount([lambeth], [])).toEqual({ account: lambeth });
    });

    it("uses it whatever the site's district", () => {
      expect(selectStripeAccount([lambeth], ["Southwark"])).toEqual({
        account: lambeth,
      });
    });

    it("uses it even if it isn't connected in this environment, so checkout can refuse it", () => {
      const unconnected = { ...lambeth, accountId: null };

      expect(selectStripeAccount([unconnected], [])).toEqual({
        account: unconnected,
      });
    });
  });

  it("refuses a team with no accounts", () => {
    expect(selectStripeAccount([], ["Lambeth"])).toEqual({
      refusal: "noAccount",
    });
  });

  describe("for a team with multiple accounts", () => {
    const accounts = [adur, worthing];

    it("uses the account named after the site's district", () => {
      expect(selectStripeAccount(accounts, ["Worthing"])).toEqual({
        account: worthing,
      });
    });

    it("matches names ignoring case and surrounding spaces", () => {
      expect(selectStripeAccount(accounts, ["  adur "])).toEqual({
        account: adur,
      });
    });

    it("refuses a site without a district", () => {
      expect(selectStripeAccount(accounts, [])).toEqual({
        refusal: "noMatchingAccount",
      });
    });

    it("refuses a site in a district without an account", () => {
      expect(selectStripeAccount(accounts, ["Lambeth"])).toEqual({
        refusal: "noMatchingAccount",
      });
    });

    it("refuses a site on the boundary of two accounts' districts", () => {
      expect(selectStripeAccount(accounts, ["Adur", "Worthing"])).toEqual({
        refusal: "multipleMatchingAccounts",
      });
    });

    it("uses the matching account even if it isn't connected, rather than falling back to another", () => {
      const unconnectedWorthing = { ...worthing, accountId: null };

      expect(
        selectStripeAccount([adur, unconnectedWorthing], ["Worthing"]),
      ).toEqual({ account: unconnectedWorthing });
    });
  });
});

describe("getLocalAuthorityDistricts", () => {
  it("returns the site's districts", () => {
    expect(
      getLocalAuthorityDistricts({
        "property.localAuthorityDistrict": ["Adur", "Worthing"],
      }),
    ).toEqual(["Adur", "Worthing"]);
  });

  it("accepts a single district", () => {
    expect(
      getLocalAuthorityDistricts({
        "property.localAuthorityDistrict": "Worthing",
      }),
    ).toEqual(["Worthing"]);
  });

  it("returns no districts when there's no passport or district", () => {
    expect(getLocalAuthorityDistricts(undefined)).toEqual([]);
    expect(getLocalAuthorityDistricts({})).toEqual([]);
  });

  it("ignores values which aren't names", () => {
    expect(
      getLocalAuthorityDistricts({
        "property.localAuthorityDistrict": ["Worthing", 1, null],
      }),
    ).toEqual(["Worthing"]);
  });
});
