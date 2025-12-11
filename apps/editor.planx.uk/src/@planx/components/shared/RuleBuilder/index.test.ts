import { Store } from "pages/FlowEditor/lib/store";

import { Condition, ConditionalRule, Operator, Rule } from "./types";
import { isRuleMet } from "./utils";

describe("isRuleMet function", () => {
  describe("simple rules", () => {
    it("evaluates to true for 'AlwaysRequired' rules", () => {
      const mockPassport: Store.Passport = { data: { testFn: "testValue" } };
      const mockRule: Rule = {
        condition: Condition.AlwaysRequired,
      };
      const result = isRuleMet(mockPassport, mockRule);

      expect(result).toBe(true);
    });

    it("evaluates to true for 'AlwaysRecommended' rules", () => {
      const mockPassport: Store.Passport = { data: { testFn: "testValue" } };
      const mockRule: Rule = {
        condition: Condition.AlwaysRecommended,
      };
      const result = isRuleMet(mockPassport, mockRule);

      expect(result).toBe(true);
    });

    it("evaluates to true for 'NotRequired' rules", () => {
      const mockPassport: Store.Passport = { data: { testFn: "testValue" } };
      const mockRule: Rule = {
        condition: Condition.NotRequired,
      };
      const result = isRuleMet(mockPassport, mockRule);

      expect(result).toBe(true);
    });
  });

  describe("conditional rules", () => {
    const mockRule: ConditionalRule<Condition.RecommendedIf> = {
      condition: Condition.RecommendedIf,
      val: "testValue",
      fn: "testFn",
      operator: Operator.Equals,
    };

    it("matches on an exact value", () => {
      const mockPassport: Store.Passport = { data: { testFn: "testValue" } };
      const result = isRuleMet(mockPassport, mockRule);

      expect(result).toBe(true);
    });

    it("does not match if an exact value is not present", () => {
      const mockPassport: Store.Passport = { data: { testFn: "missingValue" } };
      const result = isRuleMet(mockPassport, mockRule);

      expect(result).toBe(false);
    });

    it("does not match if the passport key is not present", () => {
      const mockPassport: Store.Passport = {
        data: { missingKey: "missingValue" },
      };
      const result = isRuleMet(mockPassport, mockRule);

      expect(result).toBe(false);
    });

    it("matches on an exact value in an array", () => {
      const mockPassport: Store.Passport = {
        data: { testFn: ["value1", "value2", "testValue"] },
      };
      const result = isRuleMet(mockPassport, mockRule);

      expect(result).toBe(true);
    });

    it("matches on an granular value", () => {
      const mockPassport: Store.Passport = {
        data: {
          testFn: ["value1.more.value", "value2", "testValue.more.detail"],
        },
      };
      const result = isRuleMet(mockPassport, mockRule);

      expect(result).toBe(true);
    });

    it("does not match on a partial granular value (prefix)", () => {
      const mockPassport: Store.Passport = {
        data: { testFn: ["somethingtestValue.more.detail"] },
      };
      const result = isRuleMet(mockPassport, mockRule);

      expect(result).toBe(false);
    });

    it("does not match on a partial granular value (suffix)", () => {
      const mockPassport: Store.Passport = {
        data: { testFn: ["testValueSomething.more.detail"] },
      };
      const result = isRuleMet(mockPassport, mockRule);

      expect(result).toBe(false);
    });

    it("does not match on a granular which is not a 'parent'", () => {
      const mockPassport: Store.Passport = {
        data: { testFn: ["parent.child.testValue"] },
      };
      const result = isRuleMet(mockPassport, mockRule);

      expect(result).toBe(false);
    });
  });
});
