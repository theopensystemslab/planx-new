import { GovUKPayment } from "@opensystemslab/planx-core/types";
import { isTestPayment } from "./utils";

describe("isTestPayment() helper function", () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    process.env = { ...OLD_ENV };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  test("sandbox payments", () => {
    const result = isTestPayment({
      payment_provider: "sandbox",
    } as GovUKPayment);
    expect(result).toBe(true);
  });

  test("other payment providers", () => {
    const result = isTestPayment({ payment_provider: "Visa" } as GovUKPayment);
    expect(result).toBe(false);
  });

  test("stripe payments (staging)", () => {
    process.env.APP_ENVIRONMENT = "staging";
    const result = isTestPayment({
      payment_provider: "stripe",
    } as GovUKPayment);
    expect(result).toBe(true);
  });

  test("stripe payments (production)", () => {
    process.env.APP_ENVIRONMENT = "production";
    const result = isTestPayment({
      payment_provider: "stripe",
    } as GovUKPayment);
    expect(result).toBe(false);
  });
});
