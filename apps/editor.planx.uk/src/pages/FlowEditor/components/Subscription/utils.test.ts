import type { ServiceCharge } from "./types";
import { generateServiceChargesCsv } from "./utils";

const buildServiceCharge = (
  overrides: Partial<ServiceCharge> = {},
): ServiceCharge => ({
  flowName: "Apply for a lawful development certificate",
  sessionId: "session-1",
  paymentId: "payment-1",
  amount: 100,
  paidAt: "2025-05-01T12:00:00.000Z",
  month: 5,
  monthText: "May",
  quarter: 1,
  fiscalYear: 2025,
  ...overrides,
});

describe("generateServiceChargesCsv", () => {
  it("returns a header row only when there are no charges", () => {
    expect(generateServiceChargesCsv([]).trimEnd()).toEqual(
      "Flow name,Session ID,Payment ID,Amount (excl VAT),Paid at",
    );
  });

  it("formats a charge into a row of the expected columns", () => {
    const csv = generateServiceChargesCsv([buildServiceCharge()]);
    const [, dataRow] = csv.split("\n");

    expect(dataRow).toEqual(
      "Apply for a lawful development certificate,session-1,payment-1,100,2025-05-01T12:00:00.000Z",
    );
  });

  it("produces one row per charge", () => {
    const csv = generateServiceChargesCsv([
      buildServiceCharge({ sessionId: "a" }),
      buildServiceCharge({ sessionId: "b" }),
      buildServiceCharge({ sessionId: "c" }),
    ]);

    expect(csv.trimEnd().split("\n")).toHaveLength(4);
  });

  describe("escapes characters", () => {
    const HEADER = "Flow name,Session ID,Payment ID,Amount (excl VAT),Paid at";
    const REST = "session-1,payment-1,100,2025-05-01T12:00:00.000Z";

    it.each([
      {
        scenario: "a comma",
        flowName: "Householder, minor works",
        expectedCell: '"Householder, minor works"',
      },
      {
        scenario: "a double quote",
        flowName: 'The "fast track" service',
        expectedCell: '"The ""fast track"" service"',
      },
      {
        scenario: "a line break",
        flowName: "Line one\nLine two",
        expectedCell: '"Line one\nLine two"',
      },
      {
        scenario: "a carriage return",
        flowName: "Line one\r\nLine two",
        expectedCell: '"Line one\r\nLine two"',
      },
      {
        scenario: "commas and quotes together",
        flowName: 'Apply, review, and "sign"',
        expectedCell: '"Apply, review, and ""sign"""',
      },
      {
        scenario: "an empty string",
        flowName: "",
        expectedCell: "",
      },
      {
        scenario: "non-ASCII characters",
        flowName: "Café planning – 🏠",
        expectedCell: "Café planning – 🏠",
      },
    ])("handles $scenario", ({ flowName, expectedCell }) => {
      const csv = generateServiceChargesCsv([buildServiceCharge({ flowName })]);

      expect(csv).toEqual(`${HEADER}\n${expectedCell},${REST}\n`);
    });
  });
});
