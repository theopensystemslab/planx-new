import { mockRules } from "../../FileUploadAndLabel/mocks";
import { ruleSchema } from "./schema";

describe("ruleSchema", () => {
  it("validates an 'AlwaysRequired' rule", async () => {
    const result = await ruleSchema.validate(mockRules.AlwaysRequired);
    expect(result).toEqual(mockRules.AlwaysRequired);
  });

  it("validates an 'AlwaysRecommended' rule", async () => {
    const result = await ruleSchema.validate(mockRules.AlwaysRecommended);
    expect(result).toEqual(mockRules.AlwaysRecommended);
  });

  it("validates a 'RequiredIf' rule", async () => {
    const result = await ruleSchema.validate(mockRules.RequiredIf);
    expect(result).toEqual(mockRules.RequiredIf);
  });

  it("validates a 'RecommendedIf' rule", async () => {
    const result = await ruleSchema.validate(mockRules.RecommendedIf);
    expect(result).toEqual(mockRules.RecommendedIf);
  });

  it("validates a 'NotRequired' rule", async () => {
    const result = await ruleSchema.validate(mockRules.NotRequired);
    expect(result).toEqual(mockRules.NotRequired);
  });
});
