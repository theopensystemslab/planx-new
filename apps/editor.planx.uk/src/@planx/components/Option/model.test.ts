import { Condition, Operator } from "../shared/RuleBuilder/types";
import { optionValidationSchema } from "./model";

describe("optionValidationSchema", () => {
  it("validates an option without a rule", async () => {
    const option = { id: "a", data: { text: "Option A" } };
    await expect(optionValidationSchema.isValid(option)).resolves.toBe(true);
  });

  it("validates an option with a simple rule", async () => {
    const option = {
      id: "a",
      data: { text: "Option A", rule: { condition: Condition.AlwaysRequired } },
    };
    await expect(optionValidationSchema.isValid(option)).resolves.toBe(true);
  });

  it("validates an option with a conditional rule", async () => {
    const option = {
      id: "a",
      data: {
        text: "Option A",
        rule: {
          condition: Condition.RequiredIf,
          operator: Operator.Equals,
          fn: "property.type",
          val: "residential",
        },
      },
    };
    await expect(optionValidationSchema.isValid(option)).resolves.toBe(true);
  });

  it("rejects a conditional rule without a data field", async () => {
    const option = {
      id: "a",
      data: {
        text: "Option A",
        rule: {
          condition: Condition.RequiredIf,
          operator: Operator.Equals,
          fn: null,
          val: "residential",
        },
      },
    };
    await expect(optionValidationSchema.isValid(option)).resolves.toBe(false);
  });

  it("rejects an unknown rule condition", async () => {
    const option = {
      id: "a",
      data: { text: "Option A", rule: { condition: "ShowSometimes" } },
    };
    await expect(optionValidationSchema.isValid(option)).resolves.toBe(false);
  });
});
