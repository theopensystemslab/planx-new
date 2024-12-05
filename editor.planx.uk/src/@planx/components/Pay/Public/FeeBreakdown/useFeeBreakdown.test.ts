import { logger } from "airbrake";
import { useStore } from "pages/FlowEditor/lib/store";
import { vi } from "vitest";

import { useFeeBreakdown } from "./useFeeBreakdown";

vi.mock("pages/FlowEditor/lib/store", () => ({
  useStore: vi.fn(),
}));

vi.mock("airbrake", () => ({
  logger: {
    notify: vi.fn(),
  },
}));

describe("useFeeBreakdown() hook", () => {
  describe("valid data", () => {
    it("returns a fee breakdown for number inputs", () => {
      const mockPassportData = {
        "application.fee.calculated": 1000,
        "application.fee.payable": 800,
        "application.fee.payable.includesVAT": ["true"],
        "some.other.fields": ["abc", "xyz"],
      };

      vi.mocked(useStore).mockReturnValue([mockPassportData, "test-session"]);

      const result = useFeeBreakdown();

      expect(result).toEqual({
        amount: {
          applicationFee: 1000,
          total: 800,
          reduction: 200,
          vat: 166.67,
        },
        exemptions: [],
        reductions: [],
      });
    });

    it("returns a fee breakdown for number tuple inputs", () => {
      const mockPassportData = {
        "application.fee.calculated": [1000],
        "application.fee.payable": [800],
        "application.fee.payable.includesVAT": ["true"],
        "some.other.fields": ["abc", "xyz"],
      };

      vi.mocked(useStore).mockReturnValue([mockPassportData, "test-session"]);

      const result = useFeeBreakdown();

      expect(result).toEqual({
        amount: {
          applicationFee: 1000,
          total: 800,
          reduction: 200,
          vat: 166.67,
        },
        exemptions: [],
        reductions: [],
      });
    });

    it("parses 'true' reduction values to a list of keys", () => {
      const mockPassportData = {
        "application.fee.calculated": 1000,
        "application.fee.payable": 800,
        "application.fee.payable.includesVAT": ["true"],
        "application.fee.reduction.alternative": ["true"],
        "application.fee.reduction.parishCouncil": ["true"],
        "some.other.fields": ["abc", "xyz"],
      };

      vi.mocked(useStore).mockReturnValue([mockPassportData, "test-session"]);

      const result = useFeeBreakdown();

      expect(result?.reductions).toHaveLength(2);
      expect(result?.reductions).toEqual(
        expect.arrayContaining(["alternative", "parishCouncil"])
      );
    });

    it("does not parse 'false' reduction values to a list of keys", () => {
      const mockPassportData = {
        "application.fee.calculated": 1000,
        "application.fee.payable": 800,
        "application.fee.payable.includesVAT": ["true"],
        "application.fee.reduction.alternative": ["false"],
        "application.fee.reduction.parishCouncil": ["false"],
        "some.other.fields": ["abc", "xyz"],
      };

      vi.mocked(useStore).mockReturnValue([mockPassportData, "test-session"]);

      const result = useFeeBreakdown();

      expect(result?.reductions).toHaveLength(0);
    });

    it("does not parse non-schema reduction values", () => {
      const mockPassportData = {
        "application.fee.calculated": 1000,
        "application.fee.payable": 800,
        "application.fee.payable.includesVAT": ["true"],
        "application.fee.reduction.alternative": ["true"],
        "application.fee.reduction.parishCouncil": ["false"],
        "application.fee.reduction.someReason": ["true"],
        "application.fee.reduction.someOtherReason": ["false"],
        "some.other.fields": ["abc", "xyz"],
      };

      vi.mocked(useStore).mockReturnValue([
        mockPassportData,
        "test-session",
      ]);

      const result = useFeeBreakdown();

      expect(result?.reductions).toEqual(expect.not.arrayContaining(["someReason"]))
      expect(result?.reductions).toEqual(expect.not.arrayContaining(["someOtherReason"]))
    });

    it("parses 'true' exemption values to a list of keys", () => {
      const mockPassportData = {
        "application.fee.calculated": 1000,
        "application.fee.payable": 800,
        "application.fee.payable.includesVAT": ["true"],
        "application.fee.exemption.disability": ["true"],
        "application.fee.exemption.resubmission": ["true"],
        "some.other.fields": ["abc", "xyz"],
      };

      vi.mocked(useStore).mockReturnValue([mockPassportData, "test-session"]);

      const result = useFeeBreakdown();

      expect(result?.exemptions).toHaveLength(2);
      expect(result?.exemptions).toEqual(
        expect.arrayContaining(["disability", "resubmission"])
      );
    });

    it("does not parse 'false' exemption values to a list of keys", () => {
      const mockPassportData = {
        "application.fee.calculated": 1000,
        "application.fee.payable": 800,
        "application.fee.payable.includesVAT": ["true"],
        "application.fee.exemption.disability": ["false"],
        "application.fee.exemption.resubmission": ["false"],
        "some.other.fields": ["abc", "xyz"],
      };

      vi.mocked(useStore).mockReturnValue([mockPassportData, "test-session"]);

      const result = useFeeBreakdown();

      expect(result?.exemptions).toHaveLength(0);
    });

    it("does not parse non-schema exemption values", () => {
      const mockPassportData = {
        "application.fee.calculated": 1000,
        "application.fee.payable": 800,
        "application.fee.payable.includesVAT": ["true"],
        "application.fee.exemption.disability": ["false"],
        "application.fee.exemption.resubmission": ["false"],
        "application.fee.exemption.someReason": ["true"],
        "application.fee.exemption.someOtherReason": ["false"],
        "some.other.fields": ["abc", "xyz"],
      };

      vi.mocked(useStore).mockReturnValue([
        mockPassportData,
        "test-session",
      ]);

      const result = useFeeBreakdown();

      expect(result?.exemptions).toEqual(
        expect.not.arrayContaining(["someReason"])
      );
      expect(result?.exemptions).toEqual(
        expect.not.arrayContaining(["someOtherReason"])
      );
    });
  });

  describe("invalid inputs", () => {
    it("returns undefined for missing data", () => {
      const mockPassportData = {
        "some.other.fields": ["abc", "xyz"],
      };

      vi.mocked(useStore).mockReturnValue([mockPassportData, "test-session"]);

      const result = useFeeBreakdown();

      expect(result).toBeUndefined();
    });

    it("returns undefined for partial data", () => {
      const mockPassportData = {
        "application.fee.calculated": [1000],
        "application.fee.payable.includesVAT": ["true"],
        "some.other.fields": ["abc", "xyz"],
      };

      vi.mocked(useStore).mockReturnValue([mockPassportData, "test-session"]);

      const result = useFeeBreakdown();

      expect(result).toBeUndefined();
    });

    it("returns undefined for incorrect data", () => {
      const mockPassportData = {
        "application.fee.calculated": "some string",
        "application.fee.payable": [800, 700],
        "application.fee.payable.includesVAT": false,
        "some.other.fields": ["abc", "xyz"],
      };

      vi.mocked(useStore).mockReturnValue([mockPassportData, "test-session"]);

      const result = useFeeBreakdown();

      expect(result).toBeUndefined();
    });

    it("calls Airbrake if invalid inputs are provided", () => {
      const mockPassportData = {
        "some.other.fields": ["abc", "xyz"],
      };
      const mockSessionId = "test-session";

      vi.mocked(useStore).mockReturnValue([mockPassportData, mockSessionId]);
      const loggerSpy = vi.spyOn(logger, "notify");

      const result = useFeeBreakdown();

      expect(result).toBeUndefined();

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining(mockSessionId),
      );

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining("ZodError"),
      );
    });
  });
});
